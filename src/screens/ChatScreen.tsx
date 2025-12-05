import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { matchRooms, polls, fanMoments } from "../data/mockData";

const ChatScreen: React.FC = () => {
  const [nickname, setNickname] = useState(randomNameGenerator());
  const [inputText, setInputText] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(matchRooms[0].id);
  const [pollState, setPollState] = useState(polls[1]);

  const initialRoomState = Object.fromEntries(
    matchRooms.map((room) => [
      room.id,
      room.messages.map((m) => ({
        ...m,
        isMine: m.sender === nickname,
      })) as Message[],
    ])
  );

  const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>(
    initialRoomState
  );

  const flatListRef = useRef<FlatList>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setRoomMessages((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((msg) => ({
          ...msg,
          isMine: msg.sender === nickname,
        }));
      });
      return updated;
    });
  }, [nickname]);

  const currentMessages = roomMessages[selectedRoom] ?? [];

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

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
      text: inputText,
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

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleVote = (optionId: string) => {
    setPollState((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    }));
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble message={item} />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, "#0A0A0A", colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        >
          <ScrollView
            style={styles.topScroll}
            contentContainerStyle={{ paddingBottom: spacing.md }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>Maç Odaları</Text>
            <Text style={styles.pageSubtitle}>
              Takma isimle anonim katılım, mock mesajlar ve canlı anketler
            </Text>

            <View style={styles.nicknameCard}>
              <View style={styles.nicknameRow}>
                <Ionicons name="person-circle-outline" size={24} color={colors.text} />
                <TextInput
                  style={styles.nicknameInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Takma ismin"
                  placeholderTextColor={colors.mutedText}
                />
                <Pressable
                  onPress={() => setNickname(randomNameGenerator())}
                  style={styles.refreshBtn}
                >
                  <Feather name="shuffle" size={16} color={colors.text} />
                </Pressable>
              </View>
              <Text style={styles.nicknameHint}>Giriş gerektirmez, sadece görünür ad.</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomRow}
            >
              {matchRooms.map((room) => (
                <Pressable
                  key={room.id}
                  style={[
                    styles.roomChip,
                    selectedRoom === room.id && styles.roomChipActive,
                  ]}
                  onPress={() => setSelectedRoom(room.id)}
                >
                  <Text style={styles.roomChipTitle}>{room.title}</Text>
                  <Text style={styles.roomChipMeta}>{room.time}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.pollCard}>
              <View style={styles.pollHeader}>
                <Text style={styles.pollTitle}>{pollState.question}</Text>
                <Text style={styles.pollMeta}>{pollState.closesIn} kaldı</Text>
              </View>
              {pollState.options.map((opt) => {
                const total = pollState.options.reduce(
                  (sum, item) => sum + item.votes,
                  0
                );
                const pct = Math.round((opt.votes / total) * 100);
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleVote(opt.id)}
                    style={styles.pollOption}
                  >
                    <View style={styles.pollRow}>
                      <Text style={styles.pollOptionText}>{opt.text}</Text>
                      <Text style={styles.pollOptionText}>{pct}%</Text>
                    </View>
                    <View style={styles.pollBarBackground}>
                      <View style={[styles.pollBarFill, { width: `${pct}%` }]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.momentShareRow}
          >
            {fanMoments.slice(0, 4).map((moment) => (
              <Pressable
                key={moment.id}
                style={styles.momentShareCard}
                onPress={() => {
                  const text = `Tribün Anı • ${moment.location}: ${moment.caption}`;
                  const newMessage: Message = {
                    id: `${moment.id}-${Date.now()}`,
                    text,
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
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 60);
                }}
              >
                <Text style={styles.momentShareTitle}>{moment.source}</Text>
                <Text style={styles.momentShareCaption}>{moment.caption}</Text>
                <Text style={styles.momentShareMeta}>{moment.location}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.momentShareCTA}>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />
              <Text style={styles.momentShareCTAText}>Anını ekle</Text>
            </Pressable>
          </ScrollView>

          <FlatList
            ref={flatListRef}
            data={currentMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            style={styles.chatList}
          />

          <View style={styles.inputContainer}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.05)",
                "rgba(255, 255, 255, 0.02)",
              ]}
              style={styles.inputGradient}
            >
              <View style={styles.inputWrapper}>
                <Pressable style={styles.iconButton}>
                  <Ionicons name="happy-outline" size={20} color={colors.mutedText} />
                </Pressable>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mesajını yaz..."
                  placeholderTextColor={colors.mutedText}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={280}
                />
                <Pressable onPress={handleSend}>
                  <Animated.View
                    style={[
                      styles.sendButton,
                      { transform: [{ scale: sendButtonScale }] },
                      inputText.trim().length > 0 && styles.sendButtonActive,
                    ]}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color={
                        inputText.trim().length > 0 ? colors.text : colors.mutedText
                      }
                    />
                  </Animated.View>
                </Pressable>
              </View>
              <View style={styles.inputBorder} />
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  pageTitle: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  pageSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  nicknameCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nicknameInput: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
  },
  refreshBtn: {
    padding: spacing.xs,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  nicknameHint: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
  roomRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  roomChip: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    width: 240,
  },
  roomChipActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  roomChipTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  roomChipMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs / 2,
  },
  pollCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pollTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },
  pollMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  pollOption: {
    gap: spacing.xs,
  },
  pollRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pollOptionText: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  pollBarBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  pollBarFill: {
    height: 8,
    backgroundColor: colors.primary,
  },
  momentShareRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  momentShareCard: {
    width: 220,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  momentShareTitle: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  momentShareCaption: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  momentShareMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentShareCTA: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: "rgba(15,169,88,0.05)",
  },
  momentShareCTAText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  chatList: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  inputGradient: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  inputBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});

export default ChatScreen;
