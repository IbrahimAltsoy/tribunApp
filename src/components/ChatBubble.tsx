import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine: boolean;
  isRead?: boolean;
};

type ChatBubbleProps = {
  message: Message;
  onLongPress?: (messageId: string) => void;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onLongPress }) => {
  const slideAnim = useRef(
    new Animated.Value(message.isMine ? 50 : -50)
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        message.isMine ? styles.myMessage : styles.otherMessage,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale }],
        },
      ]}
    >
      <Pressable
        onLongPress={() => onLongPress?.(message.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {message.isMine ? (
          <LinearGradient
            colors={["rgba(15, 169, 88, 0.25)", "rgba(15, 169, 88, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.myBubble]}
          >
            <View>
              <Text style={styles.messageText}>{message.text}</Text>
              <View style={styles.footer}>
                <Text style={styles.timestamp}>{message.timestamp}</Text>
                {message.isRead && (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={colors.primary}
                  />
                )}
              </View>
            </View>
            <View style={styles.bubbleBorder} />
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.otherBubble]}>
            <View>
              <Text style={styles.senderName}>{message.sender}</Text>
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestamp}>{message.timestamp}</Text>
            </View>
            <View style={styles.bubbleBorder} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    marginBottom: spacing.xs,
  },
  messageText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "flex-end",
  },
  timestamp: {
    color: colors.mutedText,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
  },
  bubbleBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});

export default ChatBubble;
