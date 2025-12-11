import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, Feather } from "@expo/vector-icons";
import ChatBubble, { Message } from "../components/ChatBubble";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { generateAmedNickname } from "../utils/amedNameGenerator";
import { initializeSession, updateNickname, UserSession } from "../utils/sessionManager";
import { sendMessageToBackend } from "../services/chatService";
import { matchRooms } from "../data/mockData";
import { useTranslation } from "react-i18next";

const IS_IOS = Platform.OS === "ios";
const quickReactions = ["⚽", "🔥", "💪", "👏", "🎯"];
const tribuneRoom = matchRooms[0];

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const [session, setSession] = useState<UserSession | null>(null);
  const [nickname, setNickname] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!tribuneRoom) return [];
    return tribuneRoom.messages.map((m) => ({
      ...m,
      isMine: m.sender === nickname,
    }));
  });

  const flatListRef = useRef<FlatList<Message>>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const onlineUsersAnim = useRef(new Animated.Value(0)).current;

  // Initialize session on mount
  useEffect(() => {
    const loadSession = async () => {
      const userSession = await initializeSession();
      setSession(userSession);
      setNickname(userSession.nickname);
    };
    loadSession();
  }, []);

  // Animate online users badge on mount
  useEffect(() => {
    Animated.spring(onlineUsersAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        isMine: msg.sender === nickname,
      }))
    );
  }, [nickname]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSendText = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || !session) return;

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

    const newMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: nickname,
      timestamp: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMine: true,
    };

    // Send to backend with sessionId
    sendMessageToBackend({
      sessionId: session.sessionId,
      nickname: nickname,
      message: trimmed,
      roomId: tribuneRoom.id,
      timestamp: Date.now()
    }).catch((error) => {
      console.error('Failed to send message to backend:', error);
      // Message still appears locally even if backend fails
    });

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    Keyboard.dismiss(); // Close keyboard after sending
    setTimeout(scrollToBottom, 80);
  }, [inputText, nickname, session, sendButtonScale, scrollToBottom]);

  const handleQuickReaction = useCallback(
    (emoji: string) => {
      const newMessage: Message = {
        id: `${Date.now()}-${emoji}`,
        text: emoji,
        sender: nickname,
        timestamp: "",
        isMine: true,
      };
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(scrollToBottom, 80);
    },
    [nickname, scrollToBottom]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Mock online users count
  const onlineUsers = 247;

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
          "rgba(0, 191, 71, 0.8)",
          "rgba(0, 191, 71, 0.6)",
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
                <Text style={styles.heroTitle}>{t("chat.title")}</Text>
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
        {/* Premium Nickname Bar */}
        <View style={styles.nickBarWrapper}>
          <BlurView
            intensity={IS_IOS ? 30 : 22}
            tint="dark"
            style={styles.nickBar}
          >
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Ionicons name="person" size={18} color={colors.white} />
              </LinearGradient>
            </View>
            <TextInput
              style={styles.nickInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t("chat.nicknamePlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />
            <Pressable
              onPress={async () => {
                const newNick = generateAmedNickname();
                setNickname(newNick);
                await updateNickname(newNick);
              }}
              style={styles.shuffleButton}
            >
              <BlurView
                intensity={IS_IOS ? 15 : 10}
                tint="dark"
                style={styles.shuffleBlur}
              >
                <Feather name="shuffle" size={16} color={colors.primary} />
              </BlurView>
            </Pressable>
          </BlurView>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          style={styles.chatList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
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
              style={({ pressed }) => [
                styles.reactionBtnWrapper,
                pressed && { opacity: 0.7 },
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

        {/* Premium Input Box */}
        <View style={styles.inputBoxWrapper}>
          <BlurView
            intensity={IS_IOS ? 35 : 25}
            tint="dark"
            style={styles.inputBoxBlur}
          >
            <View style={styles.inputBox}>
              <TextInput
                placeholder={t("chat.placeholder")}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <Animated.View
                style={{ transform: [{ scale: sendButtonScale }] }}
              >
                <Pressable
                  style={[
                    styles.sendBtnWrapper,
                    inputText.trim().length === 0 && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSendText}
                  disabled={inputText.trim().length === 0}
                >
                  <LinearGradient
                    colors={
                      inputText.trim().length > 0
                        ? [colors.primary, colors.accent]
                        : ["rgba(0, 191, 71, 0.3)", "rgba(0, 191, 71, 0.3)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendBtn}
                  >
                    <Ionicons name="send" size={18} color={colors.white} />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </BlurView>
        </View>
      </SafeAreaView>
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

  // Premium Nickname Bar
  nickBarWrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nickBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nickInput: {
    flex: 1,
    color: colors.white,
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
  },
  shuffleButton: {
    borderRadius: radii.md,
    overflow: "hidden",
  },
  shuffleBlur: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 191, 71, 0.1)",
    borderWidth: 1,
    borderColor: colors.primary,
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
});

export default ChatScreen;
