import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

type MatchCardProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  isLive?: boolean;
  onPress?: () => void;
};

const MatchCard: React.FC<MatchCardProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  time,
  isLive = false,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isLive) {
      Animated.loop(
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
      ).start();
    }
  }, [isLive]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
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
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header with date/time */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.mutedText}
              />
              <Text style={styles.dateText}>{date}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            {isLive && (
              <View style={styles.liveContainer}>
                <Animated.View
                  style={[
                    styles.liveDot,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Text style={styles.liveText}>CANLI</Text>
              </View>
            )}
          </View>

          {/* Match teams and score */}
          <View style={styles.matchContent}>
            {/* Home Team */}
            <View style={styles.teamContainer}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamInitial}>{homeTeam.charAt(0)}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {homeTeam}
              </Text>
            </View>

            {/* Score or VS */}
            <View style={styles.scoreContainer}>
              {homeScore !== undefined && awayScore !== undefined ? (
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>
                    {homeScore} - {awayScore}
                  </Text>
                </View>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
            </View>

            {/* Away Team */}
            <View style={styles.teamContainer}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamInitial}>{awayTeam.charAt(0)}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {awayTeam}
              </Text>
            </View>
          </View>

          {/* Footer with details button */}
          <View style={styles.footer}>
            <Text style={styles.detailsText}>Detayları Gör</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </LinearGradient>
        <View style={styles.borderGlow} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    backgroundColor: colors.card,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateText: {
    color: colors.mutedText,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
  },
  timeText: {
    color: colors.mutedText,
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveText: {
    color: colors.error,
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(15, 169, 88, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(15, 169, 88, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  teamInitial: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
  },
  teamName: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    textAlign: "center",
  },
  scoreContainer: {
    paddingHorizontal: spacing.md,
  },
  scoreBox: {
    backgroundColor: "rgba(15, 169, 88, 0.15)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  scoreText: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
  },
  vsText: {
    color: colors.mutedText,
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
  },
  borderGlow: {
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

export default MatchCard;
