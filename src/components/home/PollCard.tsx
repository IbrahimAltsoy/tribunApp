import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { polls } from "../../data/mockData";

type Props = {
  poll: (typeof polls)[0];
};

const PollCard: React.FC<Props> = ({ poll }) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <View style={styles.pollCard}>
      <View style={styles.pollHeader}>
        <Text style={styles.pollTitle}>{poll.question}</Text>
        <Text style={styles.pollMeta}>{poll.closesIn} kaldŽñ</Text>
      </View>
      {poll.options.map((opt) => {
        const pct = Math.round((opt.votes / totalVotes) * 100);
        return (
          <View key={opt.id} style={styles.pollOption}>
            <View style={styles.pollRow}>
              <Text style={styles.pollOptionText}>{opt.text}</Text>
              <Text style={styles.pollOptionText}>{pct}%</Text>
            </View>
            <View style={styles.pollBarBackground}>
              <View style={[styles.pollBarFill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      })}
      <Text style={styles.pollFooter}>{totalVotes} oy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pollCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pollTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },
  pollMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  pollOption: {
    gap: spacing.xs,
  },
  pollRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pollOptionText: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  pollBarBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  pollBarFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pollFooter: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
});

export default PollCard;
