import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const IS_IOS = Platform.OS === "ios";

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
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [slideAnim, fadeAnim, scale]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
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
          // My Message - Premium Gradient
          <View style={styles.myBubbleWrapper}>
            <LinearGradient
              colors={[
                "rgba(0, 191, 71, 0.35)",
                "rgba(0, 191, 71, 0.25)",
                "rgba(0, 191, 71, 0.15)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.myBubble]}
            >
              <View style={styles.bubbleContent}>
                <Text style={styles.messageText}>{message.text}</Text>
                {message.timestamp && (
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
                )}
              </View>
              <View style={[styles.bubbleBorder, styles.myBubbleBorder]} />
            </LinearGradient>
          </View>
        ) : (
          // Other Message - Glassmorphism
          <View style={styles.otherBubbleWrapper}>
            <BlurView
              intensity={IS_IOS ? 30 : 22}
              tint="dark"
              style={[styles.bubble, styles.otherBubble]}
            >
              <View style={styles.bubbleContent}>
                <View style={styles.senderRow}>
                  <View style={styles.avatarDot} />
                  <Text style={styles.senderName}>{message.sender}</Text>
                </View>
                <Text style={styles.messageText}>{message.text}</Text>
                {message.timestamp && (
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                )}
              </View>
              <View style={[styles.bubbleBorder, styles.otherBubbleBorder]} />
            </BlurView>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },

  // Bubble Wrappers
  myBubbleWrapper: {
    borderRadius: radii.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  otherBubbleWrapper: {
    borderRadius: radii.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Bubble Base
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    position: "relative",
    overflow: "hidden",
  },
  myBubble: {
    borderBottomRightRadius: radii.xs,
  },
  otherBubble: {
    backgroundColor: "rgba(19, 30, 19, 0.6)",
    borderBottomLeftRadius: radii.xs,
  },

  // Bubble Content
  bubbleContent: {
    gap: spacing.xs / 2,
  },

  // Sender Row (for other messages)
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  avatarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  senderName: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    letterSpacing: 0.3,
  },

  // Message Text
  messageText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    lineHeight: 22,
  },

  // Footer (timestamp + read status)
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "flex-end",
    marginTop: spacing.xs / 2,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    opacity: 0.7,
  },

  // Bubble Borders
  bubbleBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.xl,
    borderWidth: 1,
    pointerEvents: "none",
  },
  myBubbleBorder: {
    borderBottomRightRadius: radii.xs,
    borderColor: "rgba(0, 191, 71, 0.3)",
  },
  otherBubbleBorder: {
    borderBottomLeftRadius: radii.xs,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default ChatBubble;
