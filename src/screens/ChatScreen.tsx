import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";

const quickReactions = ["GOL!", "BRAVO", "DEFANS", "PAS", "AMED"];
const tribuneRoom = matchRooms[0];

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState(() => randomNameGenerator());
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
    if (!trimmed) return;

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

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setTimeout(scrollToBottom, 80);
  }, [inputText, nickname, sendButtonScale, scrollToBottom]);

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.background]}
        style={styles.heroSmall}
      >
        <View>
          <Text style={styles.heroTitle}>{t("chat.title")}</Text>
          <Text style={styles.heroSub}>{t("chat.subtitle")}</Text>
        </View>
        <Ionicons name="chatbubbles-outline" size={24} color={colors.text} />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <View style={styles.nickBar}>
            <Ionicons name="person-circle-outline" size={22} color={colors.text} />
            <TextInput
              style={styles.nickInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t("chat.nicknamePlaceholder")}
              placeholderTextColor={colors.dimmedText}
            />
            <Pressable onPress={() => setNickname(randomNameGenerator())}>
              <Feather name="shuffle" size={18} color={colors.text} />
            </Pressable>
          </View>

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
              <Text style={styles.emptyStateText}>{t("chat.emptyState")}</Text>
            }
          />

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

          <View style={styles.inputBoxWrapper}>
            <View style={styles.inputBox}>
              <TextInput
                placeholder={t("chat.placeholder")}
                placeholderTextColor={colors.dimmedText}
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
                  <Ionicons name="send" size={18} color={colors.text} />
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
  container: { flex: 1, backgroundColor: colors.background },
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
    color: colors.text,
    fontFamily: typography.bold,
  },
  heroSub: {
    color: colors.text,
    marginTop: 2,
    fontFamily: typography.medium,
    fontSize: 13,
  },

  nickBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
  },
  nickInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: typography.medium,
  },

  chatList: { flex: 1 },
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.sm,
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
    gap: 6,
  },
  reactionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: typography.regular,
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 24,
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default ChatScreen;
