import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import ChatBubble, { Message } from "../components/ChatBubble";
import EulaModal from "../components/EulaModal";
import ReportBlockModal from "../components/ReportBlockModal";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { initializeSession, type UserSession } from "../utils/sessionManager";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import { chatService, type ChatMessageDto, type ChatRoomDto, type ChatScheduleDto } from "../services/chatService";
import { chatHubService, BanNotification, ConnectionStatus } from "../services/chatHubService";
import { userSafetyService } from "../services/userSafetyService";
import { useBanStatus, handlePossibleBanError } from "../hooks/useBanStatus";
import { useTranslation } from "react-i18next";

const IS_IOS = Platform.OS === "ios";
const quickReactions = ["👏", "💚", "🔥", "⚽", "🎉"];
const MESSAGE_PAGE_SIZE = 50;

const formatTimestamp = (value?: string) => {
  if (!value) return "";
  // Append 'Z' so JS treats server UTC strings as UTC (not local time)
  const utcValue = /Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : value + 'Z';
  const date = new Date(utcValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
};

const isScheduleOpen = (schedule: ChatScheduleDto | null) => {
  if (!schedule) return true;
  const now = new Date();
  const startOk = !schedule.startUtc || new Date(schedule.startUtc) <= now;
  const endOk = !schedule.endUtc || now <= new Date(schedule.endUtc);
  return schedule.isOpen && startOk && endOk;
};

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, authState } = useAuth();
  const isAuthenticated = authState === "authenticated" && !!user;
  const [session, setSession] = useState<UserSession | null>(null);
  const [nickname, setNickname] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomDto | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSchedule, setChatSchedule] = useState<ChatScheduleDto | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // User Safety States
  const [showEulaModal, setShowEulaModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Edit state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");

  // Ban status
  const { isBanned, checkBanStatus, showBanAlert } = useBanStatus();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const onlineUsersAnim = useRef(new Animated.Value(0)).current;
  const nicknameRef = useRef("");
  const selectedRoomRef = useRef<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const loadSession = async () => {
      const userSession = await initializeSession();
      setSession(userSession);
      if (isAuthenticated && user) {
        setNickname(user.username);
      } else {
        setNickname(userSession.nickname);
      }

      // Check EULA status
      const needsEula = await userSafetyService.needsEulaAcceptance();
      if (needsEula) {
        setShowEulaModal(true);
      }

      // Load blocked users for filtering
      await userSafetyService.refreshBlockedSessions();
    };
    loadSession();
  }, []);

  useEffect(() => {
    nicknameRef.current = nickname;
  }, [nickname]);

  // Giriş durumu değişince nickname güncelle + SignalR bağlantısını JWT ile yenile
  useEffect(() => {
    if (isAuthenticated && user) {
      setNickname(user.username);
      // Reconnect with JWT so hub can identify the user
      chatHubService.stop().then(() => chatHubService.start());
    }
  }, [isAuthenticated, user?.username]);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom?.id ?? null;
  }, [selectedRoom]);

  // Animate online users badge on mount
  useEffect(() => {
    Animated.spring(onlineUsersAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSchedule = useCallback(async () => {
    const response = await chatService.getChatStatus();
    if (response.success && response.data) {
      setChatSchedule(response.data);
      setIsChatOpen(isScheduleOpen(response.data));
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadRooms = async () => {
      const response = await chatService.getRooms();
      if (!isActive) return;

      if (response.success && response.data) {
        const firstActive =
          response.data.find((room) => room.isActive) ||
          response.data[0] ||
          null;
        setSelectedRoom(firstActive);
        if (firstActive?.currentUserCount) {
          setOnlineUsers(firstActive.currentUserCount);
        }
      }
    };

    loadRooms();
    loadSchedule();

    return () => {
      isActive = false;
    };
  }, [loadSchedule]);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        isMine: msg.sender === nickname,
      }))
    );
  }, [nickname]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSchedule();
    setIsRefreshing(false);
  }, [loadSchedule]);

  // With inverted FlatList, "scroll to bottom" = scroll to offset 0 (index 0 is visually at bottom)
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  useEffect(() => {
    chatHubService.onMessage((incoming) => {
      if (incoming.roomId !== selectedRoomRef.current) {
        return;
      }
      // Filter out messages from blocked users (session-based or user-based)
      if (userSafetyService.isBlocked(incoming.sessionId, incoming.userId)) {
        return;
      }
      const message: Message = {
        id: incoming.id,
        text: incoming.message,
        sender: incoming.username || t("chat.anonymous"),
        timestamp: formatTimestamp(incoming.createdAt),
        isMine: incoming.username === nicknameRef.current,
        sessionId: incoming.sessionId,
        userId: incoming.userId,
      };
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) return prev;
        return [message, ...prev]; // newest first — inverted FlatList shows index 0 at bottom
      });
      setTimeout(scrollToBottom, 80);
    });

    chatHubService.onUserCount((count) => {
      setOnlineUsers(count);
    });

    chatHubService.onStatus((status) => {
      setChatSchedule(status);
      setIsChatOpen(isScheduleOpen(status));
    });

    // Re-sync schedule after reconnect (handles missed events while disconnected)
    chatHubService.onConnectionStatus((status) => {
      if (status === ConnectionStatus.Connected) {
        loadSchedule();
      }
    });

    // Handle ban notification from server
    chatHubService.onBan((_ban: BanNotification) => {
      checkBanStatus();
    });

    chatHubService.onMessageEdited((data) => {
      if (data.roomId !== selectedRoomRef.current) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id ? { ...msg, text: data.message, isEdited: data.isEdited } : msg
        )
      );
    });

    chatHubService.onMessageDeleted((data) => {
      if (data.roomId !== selectedRoomRef.current) return;
      setMessages((prev) => prev.filter((msg) => msg.id !== data.id));
    });

    chatHubService.start();

    return () => {
      chatHubService.stop();
    };
  }, [scrollToBottom, loadSchedule]);

  useEffect(() => {
    let isActive = true;

    const loadMessages = async () => {
      if (!selectedRoom) return;
      const response = await chatService.getRoomMessages(
        selectedRoom.id,
        1,
        MESSAGE_PAGE_SIZE
      );

      if (!isActive) return;

      if (response.success && response.data?.items) {
        const mapped = response.data.items
          .filter((msg: ChatMessageDto) => !userSafetyService.isBlocked(msg.sessionId, msg.userId))
          .map((msg: ChatMessageDto) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.username || t("chat.anonymous"),
            timestamp: formatTimestamp(msg.createdAt),
            isMine: msg.username === nicknameRef.current,
            isEdited: msg.isEdited,
            sessionId: msg.sessionId,
            userId: msg.userId,
          }))
          .reverse(); // newest first — inverted FlatList shows index 0 at bottom
        setMessages(mapped);
      } else {
        setMessages([]);
      }
    };

    const joinRoom = async () => {
      if (!selectedRoom) return;
      await chatHubService.joinRoom(selectedRoom.id);
    };

    loadMessages();
    joinRoom();

    return () => {
      isActive = false;
      chatHubService.leaveRoom();
    };
  }, [selectedRoom, scrollToBottom]);

  // Reload schedule whenever user navigates back to this tab
  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [loadSchedule])
  );

  const handleSendText = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !session || !selectedRoom || !isChatOpen) return;

    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    // Check ban status before sending
    if (isBanned) {
      showBanAlert();
      return;
    }

    // Verify with server
    const currentlyBanned = await checkBanStatus();
    if (currentlyBanned) {
      showBanAlert();
      return;
    }

    Animated.sequence([
      Animated.spring(sendButtonScale, {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    try {
      await chatHubService.sendMessage(selectedRoom.id, trimmed, nickname);
    } catch (error: any) {
      // Check if it's a ban error
      if (error?.message && handlePossibleBanError(error.message)) {
        await checkBanStatus();
        return;
      }

      const response = await chatService.sendMessage(selectedRoom.id, {
        username: nickname,
        message: trimmed,
      });
      if (response.success && response.data) {
        const message: Message = {
          id: response.data.id,
          text: response.data.message,
          sender: response.data.username || nickname,
          timestamp: formatTimestamp(response.data.createdAt),
          isMine: response.data.username === nickname,
        };
        setMessages((prev) => [message, ...prev]);
      } else if (response.error && handlePossibleBanError(response.error)) {
        await checkBanStatus();
        return;
      }
    }

    setInputText("");
    Keyboard.dismiss(); // Close keyboard after sending
    setTimeout(scrollToBottom, 80);
  }, [
    inputText,
    nickname,
    session,
    selectedRoom,
    isChatOpen,
    isAuthenticated,
    navigation,
    isBanned,
    sendButtonScale,
    scrollToBottom,
    showBanAlert,
    checkBanStatus,
  ]);

  const handleQuickReaction = useCallback(
    async (emoji: string) => {
      if (!session || !selectedRoom || !isChatOpen) return;

      if (!isAuthenticated) {
        navigation.navigate('Auth');
        return;
      }

      // Check ban status before sending reaction
      if (isBanned) {
        showBanAlert();
        return;
      }

      try {
        await chatHubService.sendMessage(selectedRoom.id, emoji, nickname);
      } catch (error: any) {
        // Check if it's a ban error
        if (error?.message && handlePossibleBanError(error.message)) {
          await checkBanStatus();
          return;
        }

        const response = await chatService.sendMessage(selectedRoom.id, {
          username: nickname,
          message: emoji,
        });
        if (response.success && response.data) {
          const message: Message = {
            id: response.data.id,
            text: response.data.message,
            sender: response.data.username || nickname,
            timestamp: formatTimestamp(response.data.createdAt),
            isMine: response.data.username === nickname,
          };
          setMessages((prev) => [message, ...prev]);
        } else if (response.error && handlePossibleBanError(response.error)) {
          await checkBanStatus();
          return;
        }
      }
      setTimeout(scrollToBottom, 80);
    },
    [isChatOpen, isAuthenticated, navigation, isBanned, nickname, scrollToBottom, selectedRoom, session, showBanAlert, checkBanStatus]
  );

  const handleMessageLongPress = useCallback((message: Message) => {
    // Authenticated user's own message (matched by userId)
    if (isAuthenticated && user && message.userId === user.id) {
      Alert.alert("Mesaj", undefined, [
        {
          text: "Düzenle",
          onPress: () => {
            setEditingMessage(message);
            setEditText(message.text);
          },
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!selectedRoom) return;
            try {
              await chatHubService.deleteOwnMessage(selectedRoom.id, message.id);
            } catch {
              Alert.alert("Hata", "Mesaj silinemedi.");
            }
          },
        },
        { text: "İptal", style: "cancel" },
      ]);
      return;
    }
    // Don't show report modal for own messages (anonymous/username-matched)
    if (message.isMine) return;
    setSelectedMessage(message);
    setShowReportModal(true);
  }, [isAuthenticated, user, selectedRoom]);

  const handleSubmitEdit = useCallback(async () => {
    if (!editingMessage || !selectedRoom || !editText.trim()) return;
    try {
      await chatHubService.editMessage(selectedRoom.id, editingMessage.id, editText.trim());
    } catch {
      Alert.alert("Hata", "Mesaj düzenlenemedi.");
    }
    setEditingMessage(null);
    setEditText("");
  }, [editingMessage, selectedRoom, editText]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditText("");
  }, []);

  const handleReportModalClose = useCallback(() => {
    setShowReportModal(false);
    setSelectedMessage(null);
  }, []);

  const handleBlockSuccess = useCallback(() => {
    // Filter out messages from newly blocked user (match by sessionId or userId)
    setMessages((prev) =>
      prev.filter((msg) => {
        if (selectedMessage?.userId && msg.userId === selectedMessage.userId) return false;
        if (selectedMessage?.sessionId && msg.sessionId === selectedMessage.sessionId) return false;
        return true;
      })
    );
  }, [selectedMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <ChatBubble
        message={item}
        onLongPress={() => handleMessageLongPress(item)}
      />
    ),
    [handleMessageLongPress]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const closedNote = chatSchedule?.note || t("chat.closedTitle");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[
          colors.primary,
          "rgba(197, 62, 9, 0.8)",
          "rgba(171, 44, 9, 0.6)",
          colors.background,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <BlurView
          intensity={IS_IOS ? 20 : 15}
          tint="dark"
          style={styles.heroBlur}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name="chatbubbles" size={24} color={colors.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.heroTitle}>GS Tribün</Text>
                <Text style={styles.heroSub}>{t("chat.subtitle")}</Text>
              </View>
            </View>

            {/* Online Users Badge */}
            <Animated.View
              style={[
                styles.onlineBadge,
                { transform: [{ scale: onlineUsersAnim }] },
              ]}
            >
              <BlurView
                intensity={IS_IOS ? 25 : 18}
                tint="dark"
                style={styles.onlineBadgeBlur}
              >
                <View style={styles.liveDot} />
                <Text style={styles.onlineCount}>{onlineUsers}</Text>
              </BlurView>
            </Animated.View>
          </View>
        </BlurView>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          style={styles.chatList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          inverted
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconWrapper}>
                <LinearGradient
                  colors={["rgba(0, 191, 71, 0.2)", "rgba(0, 191, 71, 0.05)"]}
                  style={styles.emptyIconGradient}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={48}
                    color={colors.primary}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.emptyStateText}>{t("chat.emptyState")}</Text>
            </View>
          }
        />

        {/* Premium Quick Reactions - Above Input */}
        <View style={styles.reactionBar}>
          {quickReactions.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => handleQuickReaction(emoji)}
              disabled={!isChatOpen || !selectedRoom}
              style={({ pressed }) => [
                styles.reactionBtnWrapper,
                pressed && { opacity: 0.7 },
                (!isChatOpen || !selectedRoom) && { opacity: 0.4 },
              ]}
            >
              <BlurView
                intensity={IS_IOS ? 25 : 18}
                tint="dark"
                style={styles.reactionBtn}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </BlurView>
            </Pressable>
          ))}
        </View>

        {/* Edit Mode Bar */}
        {editingMessage && (
          <View style={styles.editBar}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.editBarText} numberOfLines={1}>
              {editingMessage.text}
            </Text>
            <Pressable onPress={handleCancelEdit}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Premium Input Box */}
        <View style={styles.inputBoxWrapper}>
          <BlurView
            intensity={IS_IOS ? 35 : 25}
            tint="dark"
            style={styles.inputBoxBlur}
          >
            {!isAuthenticated ? (
              /* Auth gate — shown instead of input when not logged in */
              <Pressable
                style={styles.authGate}
                onPress={() => navigation.navigate('Auth')}
              >
                <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.authGateText}>Sohbete katılmak için </Text>
                <Text style={styles.authGateLink}>giriş yap</Text>
              </Pressable>
            ) : (
            <View style={styles.inputBox}>
              <TextInput
                placeholder={editingMessage ? "Mesajı düzenle..." : (isChatOpen ? t("chat.placeholder") : closedNote)}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={editingMessage ? editText : inputText}
                onChangeText={editingMessage ? setEditText : setInputText}
                multiline
                editable={editingMessage ? true : (isChatOpen && !!selectedRoom)}
              />
              <Animated.View
                style={{ transform: [{ scale: sendButtonScale }] }}
              >
                <Pressable
                  style={[
                    styles.sendBtnWrapper,
                    (editingMessage
                      ? editText.trim().length === 0
                      : (inputText.trim().length === 0 || !isChatOpen || !selectedRoom)) &&
                      styles.sendBtnDisabled,
                  ]}
                  onPress={editingMessage ? handleSubmitEdit : handleSendText}
                  disabled={
                    editingMessage
                      ? editText.trim().length === 0
                      : (inputText.trim().length === 0 || !isChatOpen || !selectedRoom)
                  }
                >
                  <LinearGradient
                    colors={
                      (editingMessage ? editText.trim().length > 0 : inputText.trim().length > 0)
                        ? [colors.primary, colors.accent]
                        : ["rgba(0, 191, 71, 0.3)", "rgba(0, 191, 71, 0.3)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendBtn}
                  >
                    <Ionicons name={editingMessage ? "checkmark" : "send"} size={18} color={colors.white} />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
            )}
          </BlurView>
        </View>
      </SafeAreaView>

      {/* EULA Modal */}
      <EulaModal
        visible={showEulaModal}
        onAccept={() => setShowEulaModal(false)}
      />

      {/* Report/Block Modal */}
      {selectedMessage && (
        <ReportBlockModal
          visible={showReportModal}
          onClose={handleReportModalClose}
          targetUserId={selectedMessage.userId}
          contentType="ChatMessage"
          contentId={selectedMessage.id}
          onBlockSuccess={handleBlockSuccess}
          onAuthRequired={() => navigation.navigate('Auth')}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },

  // Premium Header
  heroGradient: {
    overflow: "hidden",
  },
  heroBlur: {
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    backgroundColor: "rgba(19, 30, 19, 0.3)",
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: fontSizes.xxl,
    color: colors.white,
    fontFamily: typography.bold,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSub: {
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },

  // Online Users Badge
  onlineBadge: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  onlineBadgeBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  onlineCount: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },

  // Messages
  chatList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
  },
  emptyIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    maxWidth: "80%",
  },

  // Premium Quick Reactions
  reactionBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  reactionBtnWrapper: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  reactionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  reactionEmoji: {
    fontSize: 24,
  },

  // Auth gate (shown instead of input when not logged in)
  authGate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  authGateText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  authGateLink: {
    color: colors.primary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },

  // Premium Input Box
  inputBoxWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radii.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  inputBoxBlur: {
    backgroundColor: "rgba(19, 30, 19, 0.8)",
    borderRadius: radii.xxl,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    maxHeight: 60,
    paddingVertical: 4,
  },
  sendBtnWrapper: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  editBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(0, 191, 71, 0.1)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 191, 71, 0.3)",
  },
  editBarText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
  },
});

export default ChatScreen;
