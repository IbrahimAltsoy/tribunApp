import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";

type Props = {
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
};

const SectionHeader: React.FC<Props> = React.memo(
  ({ title, subtitle, icon, accentColor = colors.primary }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.sectionHeader,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Left: Title & Subtitle Container */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            {/* Optional Icon */}
            {icon && (
              <View style={[styles.iconWrapper, { borderColor: accentColor }]}>
                <Ionicons name={icon as any} size={18} color={accentColor} />
              </View>
            )}

            {/* Title with Gradient Underline */}
            <View style={styles.titleGroup}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <LinearGradient
                colors={[accentColor, "rgba(0, 191, 71, 0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleUnderline}
              />
            </View>
          </View>

          {/* Subtitle */}
          {subtitle && (
            <Text style={[styles.sectionSubtitle, icon && styles.sectionSubtitleWithIcon]}>{subtitle}</Text>
          )}
        </View>

        {/* Right: Animated Accent Indicator */}
        <Animated.View
          style={[
            styles.accentContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={[
              accentColor,
              colors.primary,
              "rgba(0, 191, 71, 0.3)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionAccent}
          />
          {/* Glow Effect */}
          <View
            style={[
              styles.accentGlow,
              { backgroundColor: accentColor },
            ]}
          />
        </Animated.View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.sm,
  },

  // Text Container
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 191, 71, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Title Group with Underline
  titleGroup: {
    position: "relative",
  },
  sectionTitle: {
    color: colors.white,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    position: "absolute",
    bottom: -4,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    opacity: 0.8,
  },

  // Subtitle
  sectionSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    letterSpacing: 0.3,
  },
  sectionSubtitleWithIcon: {
    marginLeft: 48,
  },

  // Accent Indicator (Right)
  accentContainer: {
    position: "relative",
    marginLeft: spacing.md,
  },
  sectionAccent: {
    width: 60,
    height: 4,
    borderRadius: radii.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  accentGlow: {
    position: "absolute",
    width: 60,
    height: 4,
    borderRadius: radii.sm,
    opacity: 0.3,
    top: 0,
    left: 0,
  },
});

export default SectionHeader;
