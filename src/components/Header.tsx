import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

const IS_IOS = Platform.OS === "ios";

type HeaderProps = {
  onPressNotifications?: () => void;
  onPressLanguage?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  onPressNotifications,
  onPressLanguage,
}) => {
  const { i18n } = useTranslation();
  const notificationScale = useRef(new Animated.Value(1)).current;
  const languageScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(-10)).current;

  // Brand entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(brandTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Badge pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePressIn = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = (scaleValue: Animated.Value) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const currentLanguage = i18n.language.toUpperCase();

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.background, "rgba(19, 30, 19, 0.95)", colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Left Action: Language Button */}
        <Pressable
          onPress={onPressLanguage}
          onPressIn={() => handlePressIn(languageScale)}
          onPressOut={() => handlePressOut(languageScale)}
          style={styles.actionButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Animated.View
            style={[
              styles.actionButtonInner,
              { transform: [{ scale: languageScale }] },
            ]}
          >
            <BlurView
              intensity={IS_IOS ? 25 : 20}
              tint="dark"
              style={styles.actionBlur}
            >
              <Text style={styles.languageText}>{currentLanguage}</Text>
            </BlurView>
          </Animated.View>
        </Pressable>

        {/* Center: Brand Name */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandText}>
            <Text style={styles.brandTextBi}>Bi</Text>
            <Text style={styles.brandTextHevra}>hevra</Text>
          </Text>
          <View style={styles.brandUnderline} />
          <Text style={styles.liveTag}>
            <View style={styles.liveDot} />
            {" "}CANLI TAKİP
          </Text>
        </Animated.View>

        {/* Right Action: Notification Button */}
        <Pressable
          onPress={onPressNotifications}
          onPressIn={() => handlePressIn(notificationScale)}
          onPressOut={() => handlePressOut(notificationScale)}
          style={styles.actionButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Animated.View
            style={[
              styles.actionButtonInner,
              { transform: [{ scale: notificationScale }] },
            ]}
          >
            <BlurView
              intensity={IS_IOS ? 25 : 20}
              tint="dark"
              style={styles.actionBlur}
            >
              <Ionicons
                name="notifications"
                size={22}
                color={colors.white}
              />
              {/* Animated Badge */}
              <Animated.View
                style={[
                  styles.notificationBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            </BlurView>
          </Animated.View>
        </Pressable>
      </View>

      {/* Premium Gradient Divider */}
      <View style={styles.dividerContainer}>
        <LinearGradient
          colors={[
            "rgba(0, 191, 71, 0)",
            "rgba(0, 191, 71, 0.3)",
            colors.primary,
            "rgba(209, 14, 14, 0.6)",
            "rgba(209, 14, 14, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    position: "relative",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    position: "relative",
    zIndex: 10,
  },

  // Brand Section (Center)
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: spacing.md,
  },
  brandText: {
    fontSize: 32,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  brandTextBi: {
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
    fontWeight: "700",
    color: colors.primary,
    textShadowColor: colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  brandTextHevra: {
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-light",
      default: "System",
    }),
    fontWeight: "300",
    color: colors.white,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandUnderline: {
    width: 100,
    height: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs,
    borderRadius: 1,
    opacity: 0.8,
  },
  liveTag: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    letterSpacing: 1.8,
    fontWeight: "600",
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 4,
  },

  // Action Buttons (Left & Right)
  actionButton: {
    borderRadius: radii.xl,
  },
  actionButtonInner: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  actionBlur: {
    width: 50,
    height: 50,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.4)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  languageText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },

  // Notification Badge
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Divider
  dividerContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    height: 2.5,
    borderRadius: 2,
    opacity: 0.9,
  },
});

export default Header;
