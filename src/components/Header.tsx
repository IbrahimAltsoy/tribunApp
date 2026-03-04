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
  notificationCount?: number;
};

const Header: React.FC<HeaderProps> = ({
  onPressNotifications,
  notificationCount = 0,
}) => {
  const { t } = useTranslation();
  const notificationScale = useRef(new Animated.Value(1)).current;
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

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.background, "rgba(30, 10, 10, 0.95)", colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Left spacer — keeps brand centered */}
        <View style={styles.actionSpacer} />

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
            <Text style={styles.brandTextGS}>GS </Text>
            <Text style={styles.brandTextTribun}>Tribün</Text>
          </Text>
          <View style={styles.brandUnderline} />
          <Text style={styles.liveTag}>
            <View style={styles.liveDot} />
            {" "}{t("header.liveTracking")}
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
              {notificationCount > 0 && (
                <Animated.View
                  style={[
                    styles.notificationBadge,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  {notificationCount > 9 ? (
                    <Text style={styles.notificationBadgeText}>9+</Text>
                  ) : (
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount}
                    </Text>
                  )}
                </Animated.View>
              )}
            </BlurView>
          </Animated.View>
        </Pressable>
      </View>

      {/* Premium Gradient Divider */}
      <View style={styles.dividerContainer}>
        <LinearGradient
          colors={[
            "rgba(232, 17, 26, 0)",
            "rgba(232, 17, 26, 0.4)",
            colors.primary,
            "rgba(255, 199, 44, 0.6)",
            "rgba(255, 199, 44, 0)",
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
  brandTextGS: {
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
    fontWeight: "800",
    color: colors.accent,
    textShadowColor: colors.accentGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  brandTextTribun: {
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

  // Left spacer (keeps brand centered)
  actionSpacer: {
    width: 50,
    height: 50,
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
    backgroundColor: "rgba(18, 18, 18, 0.85)",
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

  // Notification Badge
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#1A1A1A",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
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
