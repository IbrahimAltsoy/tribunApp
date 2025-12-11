import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { polls } from "../../data/mockData";

const IS_IOS = Platform.OS === "ios";

type Props = {
  poll: (typeof polls)[0];
};

const PollOption: React.FC<{
  option: (typeof polls)[0]["options"][0];
  percentage: number;
  index: number;
}> = ({ option, percentage, index }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 1000,
        delay: index * 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 150,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [percentage, index]);

  const isWinning = percentage > 40;

  return (
    <Animated.View
      style={[
        styles.pollOption,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.pollRow}>
        <View style={styles.optionLabelRow}>
          {isWinning && (
            <View style={styles.winningBadge}>
              <Ionicons name="trophy" size={12} color={colors.primary} />
            </View>
          )}
          <Text style={styles.pollOptionText}>{option.text}</Text>
        </View>
        <Text style={[styles.pollOptionPercent, isWinning && styles.winningPercent]}>
          {percentage}%
        </Text>
      </View>

      {/* Animated Progress Bar */}
      <View style={styles.pollBarBackground}>
        <Animated.View
          style={[
            styles.pollBarFillContainer,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={
              isWinning
                ? [colors.primary, colors.accent]
                : ["rgba(0, 191, 71, 0.6)", "rgba(0, 191, 71, 0.3)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pollBarFill}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const PollCard: React.FC<Props> = React.memo(({ poll }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <Animated.View style={[styles.pollCard, { opacity: fadeAnim }]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[
          "rgba(0, 191, 71, 0.05)",
          "rgba(19, 30, 19, 0.95)",
          "rgba(209, 14, 14, 0.05)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.pollHeader}>
        <View style={styles.pollIconWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pollIconGradient}
          >
            <Ionicons name="stats-chart" size={18} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.pollHeaderText}>
          <Text style={styles.pollTitle}>{poll.question}</Text>
          <View style={styles.pollMetaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.pollMeta}>{poll.closesIn} kaldı</Text>
          </View>
        </View>
      </View>

      {/* Poll Options */}
      <View style={styles.pollOptionsContainer}>
        {poll.options.map((opt, index) => {
          const pct = Math.round((opt.votes / totalVotes) * 100);
          return <PollOption key={opt.id} option={opt} percentage={pct} index={index} />;
        })}
      </View>

      {/* Footer */}
      <BlurView
        intensity={IS_IOS ? 15 : 10}
        tint="dark"
        style={styles.pollFooter}
      >
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={styles.pollFooterText}>
              {totalVotes.toLocaleString("tr-TR")} oy
            </Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
            <Text style={styles.pollFooterText}>Canlı Sonuçlar</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  pollCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    gap: spacing.lg,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // Header
  pollHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  pollIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    overflow: "hidden",
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
  pollIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pollHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  pollTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
  },
  pollMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  pollMeta: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },

  // Options Container
  pollOptionsContainer: {
    gap: spacing.md,
  },

  // Poll Option
  pollOption: {
    gap: spacing.xs,
  },
  pollRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },
  optionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  winningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 191, 71, 0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pollOptionText: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  pollOptionPercent: {
    color: colors.textSecondary,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  winningPercent: {
    color: colors.primary,
  },

  // Progress Bar
  pollBarBackground: {
    height: 10,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
  },
  pollBarFillContainer: {
    height: "100%",
  },
  pollBarFill: {
    flex: 1,
    borderRadius: radii.sm,
  },

  // Footer
  pollFooter: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
    backgroundColor: "rgba(19, 30, 19, 0.5)",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.glassStroke,
  },
  pollFooterText: {
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
});

export default PollCard;
