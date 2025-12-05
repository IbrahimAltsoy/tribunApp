import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import ChatBubble, { Message } from "../components/ChatBubble";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import randomNameGenerator from "../utils/randomNameGenerator";

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Bugünkü maç harikaydı! Tribünler coştu! 🔥",
    sender: "AmedLion-456",
    timestamp: "14:23",
    isMine: false,
  },
  {
    id: "2",
    text: "Kesinlikle! Takımımız muhteşem oynadı 💚",
    sender: "Sen",
    timestamp: "14:24",
    isMine: true,
    isRead: true,
  },
  {
    id: "3",
    text: "Şampiyonluk yolunda ilerliyoruz!",
    sender: "GreenWave-789",
    timestamp: "14:25",
    isMine: false,
  },
  {
    id: "4",
    text: "Önümüzdeki maç için hazır mısınız? 🎯",
    sender: "Sen",
    timestamp: "14:26",
    isMine: true,
    isRead: true,
  },
];

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Haptics not available");
    }

    // Animate send button
    Animated.sequence([
      Animated.spring(sendButtonScale, {
        toValue: 0.8,
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
      sender: "Sen",
      timestamp: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMine: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate other user response after 2 seconds
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getRandomResponse(),
        sender: randomNameGenerator(),
        timestamp: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMine: false,
      };
      setMessages((prev) => [...prev, responseMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 2000);
  };

  const getRandomResponse = () => {
    const responses = [
      "Katılıyorum! 👍",
      "Harika bir gözlem!",
      "Maç için sabırsızlanıyorum! ⚽",
      "Tribün ruhu burada! 💚",
      "AMEDSPOR! 🔥",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleLongPress = (messageId: string) => {
    console.log("Long press on message:", messageId);
    // Here you can add context menu for delete, copy, etc.
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble message={item} onLongPress={handleLongPress} />
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
          {/* Chat List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.05)",
                "rgba(255, 255, 255, 0.02)",
              ]}
              style={styles.inputGradient}
            >
              <View style={styles.inputWrapper}>
                <Pressable style={styles.emojiButton}>
                  <Ionicons
                    name="happy-outline"
                    size={24}
                    color={colors.mutedText}
                  />
                </Pressable>

                <TextInput
                  style={styles.textInput}
                  placeholder="Mesajınızı yazın..."
                  placeholderTextColor={colors.mutedText}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
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
                      size={20}
                      color={
                        inputText.trim().length > 0
                          ? colors.text
                          : colors.mutedText
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
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  emojiButton: {
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
