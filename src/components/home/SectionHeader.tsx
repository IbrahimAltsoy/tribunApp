import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";

type Props = {
  title: string;
  subtitle?: string;
};

const SectionHeader: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.sectionAccent} />
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontFamily: typography.semiBold,
  },
  sectionSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs / 2,
  },
  sectionAccent: {
    width: "40%",
    height: 1,
    borderRadius: 4,
    backgroundColor: colors.accent,
    opacity: 0.8,
  },
});

export default SectionHeader;
