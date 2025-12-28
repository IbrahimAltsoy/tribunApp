import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Platform, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { pollService } from "../../services/pollService";
import { pollSignalRService, ConnectionStatus } from "../../services/pollSignalRService";
import type { PollDto } from "../../types/poll";

const IS_IOS = Platform.OS === "ios";

type Props = {
  poll: PollDto;
  onVoteSuccess?: (updatedPoll: PollDto) => void;
};

const PollOption: React.FC<{
  option: PollDto["options"][0];
  percentage: number;
  index: number;
  onVote: (optionId: string) => void;
  isVoting: boolean;
  isSelected: boolean;
}> = ({ option, percentage, index, onVote, isVoting, isSelected }) => {
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
    <Pressable
      onPress={() => !isVoting && !isSelected && onVote(option.id)}
      disabled={isVoting || isSelected}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Animated.View
        style={[
          styles.pollOption,
          { transform: [{ scale: scaleAnim }] },
          isSelected && styles.selectedOption,
        ]}
      >
        <View style={styles.pollRow}>
          <View style={styles.optionLabelRow}>
            {isWinning && (
              <View style={styles.winningBadge}>
                <Ionicons name="trophy" size={12} color={colors.primary} />
              </View>
            )}
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              </View>
            )}
            <Text style={styles.pollOptionText}>{option.text}</Text>
          </View>
          <View style={styles.pollOptionRightSide}>
            {isVoting && isSelected ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.pollOptionPercent, isWinning && styles.winningPercent]}>
                {percentage}%
              </Text>
            )}
          </View>
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
    </Pressable>
  );
};

const PollCard: React.FC<Props> = React.memo(({ poll, onVoteSuccess }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isVoting, setIsVoting] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [localPoll, setLocalPoll] = useState(poll);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Connected);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Update local poll when prop changes
  useEffect(() => {
    setLocalPoll(poll);
  }, [poll]);

  // Check if user has already voted (on mount) - poll-based check
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const sessionId = await pollService.getSessionId();

        // Check if user voted for this poll (poll-based, not option-based)
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/polls/voted-option?pollId=${poll.id}&sessionId=${sessionId}`
        );
        const json = await response.json();

        if (json.success && json.data) {
          setVotedOptionId(json.data);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };

    checkVoteStatus();
  }, [poll.id]);

  // Real-time SignalR: Connect to poll hub and subscribe to updates
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        // Start SignalR connection (gracefully fails if offline)
        await pollSignalRService.start();

        // Subscribe to this specific poll
        await pollSignalRService.subscribeToPoll(poll.id);

        // Listen for poll updates from server
        pollSignalRService.onPollUpdated((updatedPoll) => {
          if (updatedPoll.id === poll.id) {
            // Update local poll with latest vote counts
            setLocalPoll(updatedPoll);

            // Notify parent component
            if (onVoteSuccess) {
              onVoteSuccess(updatedPoll);
            }
          }
        });

        // Listen for connection status changes
        pollSignalRService.onConnectionStatus((status) => {
          setConnectionStatus(status);
        });
      } catch {
        // Completely silent - app works perfectly without SignalR
        // User can still vote, just won't see real-time updates from others
      }
    };

    setupSignalR();

    // Cleanup: Unsubscribe when component unmounts
    return () => {
      pollSignalRService.unsubscribeFromPoll(poll.id);
    };
  }, [poll.id, onVoteSuccess]);

  // Pulse animation for reconnecting indicator
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.Reconnecting) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop pulsing and reset
      pulseAnim.setValue(1);
    }
  }, [connectionStatus]);

  const handleVote = useCallback(async (optionId: string) => {
    setIsVoting(true);
    setVotedOptionId(optionId); // Optimistically set voted option

    try {
      const response = await pollService.votePoll(optionId);

      if (response.success && response.data) {
        // Update local poll with new vote counts
        setLocalPoll(response.data);

        // Notify parent component
        if (onVoteSuccess) {
          onVoteSuccess(response.data);
        }

        console.log('✅ Vote successful');
      } else {
        // Revert optimistic update on failure
        setVotedOptionId(null);
        console.error('❌ Vote failed:', response.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      setVotedOptionId(null);
      console.error('❌ Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  }, [onVoteSuccess]);

  const totalVotes = localPoll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

  const closesInText = localPoll.closesAt
    ? new Date(localPoll.closesAt).toLocaleDateString('tr-TR')
    : 'Devam ediyor';

  const hasVoted = votedOptionId !== null;

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
          <View style={styles.titleRow}>
            <Text style={styles.pollTitle}>{localPoll.question}</Text>
            {/* Subtle connection indicator */}
            {connectionStatus === ConnectionStatus.Reconnecting && (
              <Animated.View style={[styles.connectionDot, { opacity: pulseAnim }]}>
                <View style={styles.reconnectingDot} />
              </Animated.View>
            )}
            {connectionStatus === ConnectionStatus.Failed && (
              <View style={styles.connectionDot}>
                <View style={styles.offlineDot} />
              </View>
            )}
          </View>
          <View style={styles.pollMetaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.pollMeta}>{closesInText}</Text>
            {/* Subtle text indicator when reconnecting */}
            {connectionStatus === ConnectionStatus.Reconnecting && (
              <Text style={styles.reconnectingText}>• Yeniden bağlanıyor</Text>
            )}
            {connectionStatus === ConnectionStatus.Failed && (
              <Text style={styles.offlineText}>• Çevrimdışı</Text>
            )}
          </View>
        </View>
      </View>

      {/* Poll Options */}
      <View style={styles.pollOptionsContainer}>
        {localPoll.options.map((opt, index) => {
          return (
            <PollOption
              key={opt.id}
              option={opt}
              percentage={opt.votePercentage}
              index={index}
              onVote={handleVote}
              isVoting={isVoting}
              isSelected={votedOptionId === opt.id}
            />
          );
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
            <Ionicons
              name={hasVoted ? "checkmark-circle" : "radio-button-off"}
              size={14}
              color={hasVoted ? colors.accent : colors.textTertiary}
            />
            <Text style={styles.pollFooterText}>
              {hasVoted ? 'Oylandı' : 'Oy Kullan'}
            </Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pollTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
    flex: 1,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  reconnectingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFA500", // Orange for reconnecting
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#888", // Gray for offline
  },
  reconnectingText: {
    color: "#FFA500",
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
  },
  offlineText: {
    color: "#888",
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
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
  selectedOption: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.xs,
    backgroundColor: "rgba(0, 191, 71, 0.05)",
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
  pollOptionRightSide: {
    minWidth: 50,
    alignItems: "flex-end",
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
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 191, 71, 0.2)",
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
