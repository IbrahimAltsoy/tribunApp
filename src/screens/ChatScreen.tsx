import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
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
import { Ionicons, Feather } from "@expo/vector-icons";
import ChatBubble, { Message } from "../components/ChatBubble";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import randomNameGenerator from "../utils/randomNameGenerator";
import { matchRooms } from "../data/mockData";

// Faz tipleri: maç öncesi / maç sırası / maç sonrası
type MatchRoomPhase = "pre" | "live" | "post";

const phaseConfig: Record<
  MatchRoomPhase,
  { label: string; title: string; subtitle: string; inputPlaceholder: string }
> = {
  pre: {
    label: "Maç Öncesi",
    title: "Hazırlık sohbeti",
    subtitle: "Buluşma, koreografi, pankart ve moral yükseltme.",
    inputPlaceholder: "Planları, buluşma noktasını, pankart fikrini yaz...",
  },
  live: {
    label: "Maç Sırası",
    title: "Canlı maç sohbeti",
    subtitle: "Gol tepkisi, hakem yorumları, canlı tribün hissi.",
    inputPlaceholder: "Pozisyon yorumu, tepki ya da kısa mesaj yaz...",
  },
  post: {
    label: "Maç Sonrası",
    title: "Değerlendirme sohbeti",
    subtitle: "Maç özeti, oyuncu performansı ve eve dönüş muhabbeti.",
    inputPlaceholder: "Maç yorumu, oyuncu değerlendirmesi yaz...",
  },
};

const quickReactions = ["🔥", "🥅", "😡", "👏", "🟢"];

const ChatScreen: React.FC = () => {
  const [nickname, setNickname] = useState(() => randomNameGenerator());
  const [inputText, setInputText] = useState("");
  const [activePhase, setActivePhase] = useState<MatchRoomPhase>("pre");

  const [selectedRoom, setSelectedRoom] = useState(() => {
    const firstPre = matchRooms.find((r) => r.phase === "pre");
    return firstPre?.id ?? matchRooms[0]?.id;
  });

  // Oda -> mesajlar state'i
  const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>(
    () => {
      const initial: Record<string, Message[]> = {};
      matchRooms.forEach((room) => {
        initial[room.id] = room.messages.map((m) => ({
          ...m,
          isMine: m.sender === nickname,
        }));
      });
      return initial;
    }
  );

  const flatListRef = useRef<FlatList<Message>>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Nickname değişince isMine bayraklarını yeniden hesapla
  useEffect(() => {
    setRoomMessages((prev) => {
      const updated: Record<string, Message[]> = {};
      Object.keys(prev).forEach((roomId) => {
        updated[roomId] = prev[roomId].map((msg) => ({
          ...msg,
          isMine: msg.sender === nickname,
        }));
      });
      return updated;
    });
  }, [nickname]);

  const roomsForPhase = useMemo(
    () => matchRooms.filter((room) => room.phase === activePhase),
    [activePhase]
  );

  const currentMessages = useMemo(
    () => roomMessages[selectedRoom] ?? [],
    [roomMessages, selectedRoom]
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleChangePhase = useCallback((phase: MatchRoomPhase) => {
    setActivePhase(phase);
    const firstRoom = matchRooms.find((room) => room.phase === phase);
    if (firstRoom) {
      setSelectedRoom(firstRoom.id);
    }
  }, []);

  const handleSendText = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || !selectedRoom) return;

    Animated.sequence([
      Animated.spring(sendButtonScale, {
        toValue: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        useNativeDriver: true,
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

    setRoomMessages((prev) => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), newMessage],
    }));
    setInputText("");
    setTimeout(scrollToBottom, 80);
  }, [inputText, nickname, selectedRoom, sendButtonScale, scrollToBottom]);

  const handleQuickReaction = useCallback(
    (emoji: string) => {
      if (!selectedRoom) return;

      const newMessage: Message = {
        id: `${Date.now()}-${emoji}`,
        text: emoji,
        sender: nickname,
        timestamp: "",
        isMine: true,
      };

      setRoomMessages((prev) => ({
        ...prev,
        [selectedRoom]: [...(prev[selectedRoom] || []), newMessage],
      }));
      setTimeout(scrollToBottom, 80);
    },
    [nickname, selectedRoom, scrollToBottom]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const currentPhaseConfig = phaseConfig[activePhase];

  return (
    <View style={styles.container}>
      {/* Üst mini hero */}
      <LinearGradient
        colors={["#0fa958", "#0fa95890", colors.background]}
        style={styles.heroSmall}
      >
        <View>
          <Text style={styles.heroTitle}>Amedspor Sohbet</Text>
          <Text style={styles.heroSub}>Maç öncesi · sırası · sonrası</Text>
        </View>
        <Ionicons name="chatbubbles-outline" size={24} color="#ffffffdd" />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          {/* Nickname bar */}
          <View style={styles.nickBar}>
            <Ionicons name="person-circle-outline" size={22} color="#fff" />
            <TextInput
              style={styles.nickInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Takma ad"
              placeholderTextColor="#7e7e7e"
            />
            <Pressable onPress={() => setNickname(randomNameGenerator())}>
              <Feather name="shuffle" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Faz sekmeleri */}
          <View style={styles.tabs}>
            {(["pre", "live", "post"] as MatchRoomPhase[]).map((phase) => (
              <Pressable
                key={phase}
                onPress={() => handleChangePhase(phase)}
                style={[styles.tab, activePhase === phase && styles.tabActive]}
              >
                <Text
                  style={
                    activePhase === phase
                      ? styles.tabTextActive
                      : styles.tabText
                  }
                >
                  {phaseConfig[phase].label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Faz açıklaması */}
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseTitle}>{currentPhaseConfig.title}</Text>
            <Text style={styles.phaseSubtitle}>
              {currentPhaseConfig.subtitle}
            </Text>
          </View>

          {/* Oda chipleri */}
          <View style={styles.roomRow}>
            {roomsForPhase.length === 0 ? (
              <Text style={styles.emptyRoomsText}>
                Bu faz için henüz oda tanımlı değil.
              </Text>
            ) : (
              roomsForPhase.map((room) => (
                <Pressable
                  key={room.id}
                  onPress={() => setSelectedRoom(room.id)}
                  style={[
                    styles.roomChip,
                    selectedRoom === room.id && styles.roomChipActive,
                  ]}
                >
                  <Text style={styles.roomTitle}>{room.title}</Text>
                  <Text style={styles.roomTime}>{room.time}</Text>
                  {room.status === "live" && (
                    <Text style={styles.roomBadgeLive}>CANLI</Text>
                  )}
                  {room.status === "finished" && (
                    <Text style={styles.roomBadgeFinished}>BİTTİ</Text>
                  )}
                </Pressable>
              ))
            )}
          </View>

          {/* Mesaj listesi */}
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            style={styles.chatList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyStateText}>
                İlk mesajı sen at, tribünü ısıt. 🔥
              </Text>
            }
          />

          {/* Maç sırası hızlı reaksiyon barı */}
          {activePhase === "live" && (
            <View style={styles.reactionBar}>
              {quickReactions.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => handleQuickReaction(emoji)}
                  style={styles.reactionBtn}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Mesaj input alanı */}
          <View style={styles.inputBoxWrapper}>
            <View style={styles.inputBox}>
              <TextInput
                placeholder={currentPhaseConfig.inputPlaceholder}
                placeholderTextColor="#7e7e7e"
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
                    styles.sendBtn,
                    inputText.trim().length === 0 && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSendText}
                  disabled={inputText.trim().length === 0}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },

  heroSmall: {
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 22,
    color: "#fff",
    fontFamily: typography.bold,
  },
  heroSub: {
    color: "#e6e6e6",
    marginTop: 2,
    fontFamily: typography.medium,
    fontSize: 13,
  },

  nickBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
  },
  nickInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: typography.medium,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: "#0fa95855",
  },
  tabText: {
    color: "#aaa",
    fontFamily: typography.semiBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: "#fff",
    fontFamily: typography.semiBold,
    fontSize: 12,
  },

  phaseInfo: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  phaseTitle: {
    color: "#fff",
    fontFamily: typography.semiBold,
    fontSize: 14,
  },
  phaseSubtitle: {
    color: "#888",
    fontFamily: typography.medium,
    fontSize: 12,
    marginTop: 2,
  },

  roomRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  emptyRoomsText: {
    color: "#777",
    fontFamily: typography.medium,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  roomChip: {
    padding: 10,
    backgroundColor: "#111",
    borderRadius: 12,
    marginRight: 8,
    minWidth: 140,
  },
  roomChipActive: {
    backgroundColor: "#0fa95833",
    borderWidth: 1,
    borderColor: "#0fa958",
  },
  roomTitle: {
    color: "#fff",
    fontFamily: typography.semiBold,
  },
  roomTime: {
    color: "#999",
    fontSize: 11,
    marginTop: 2,
    fontFamily: typography.medium,
  },
  roomBadgeLive: {
    color: "#0fa958",
    fontFamily: typography.semiBold,
    fontSize: 11,
    marginTop: 2,
  },
  roomBadgeFinished: {
    color: "#f39c12",
    fontFamily: typography.semiBold,
    fontSize: 11,
    marginTop: 2,
  },

  chatList: { flex: 1 },
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  emptyStateText: {
    textAlign: "center",
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.md,
  },

  reactionBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  reactionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#111",
  },
  reactionEmoji: {
    fontSize: 18,
  },

  inputBoxWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  inputBox: {
    backgroundColor: "#111",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontFamily: typography.regular,
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: "#0fa958",
    padding: 10,
    borderRadius: 24,
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default ChatScreen;
