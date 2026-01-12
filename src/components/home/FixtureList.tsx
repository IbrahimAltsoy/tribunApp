import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { useTranslation } from "react-i18next";

interface Fixture {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  isHome: boolean;
  status?: "upcoming" | "live" | "finished";
  score?: string;
}

type Props = {
  fixtures: Fixture[];
};

const FixtureList: React.FC<Props> = ({ fixtures }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.fixtureList}>
      {fixtures.map((fixture) => (
        <View key={fixture.id} style={styles.fixtureCard}>
          <View style={styles.fixtureRow}>
            <View style={styles.fixtureContent}>
              <Text style={styles.fixtureOpponent}>Amedspor</Text>
              <Text style={styles.fixtureVs}>
                {t("fixture.vsDash", {
                  home: "Amedspor",
                  away: fixture.opponent,
                })}{" "}
              </Text>
              <Text style={styles.fixtureMeta}>
                {fixture.date} | {fixture.time}
              </Text>
              <Text style={styles.fixtureVenue}>{fixture.venue}</Text>
            </View>
            <View
              style={[
                styles.fixtureTag,
                fixture.isHome ? styles.homeTag : styles.awayTag,
              ]}
            >
              <Text
                style={[
                  styles.fixtureTagText,
                  fixture.isHome ? styles.homeTagText : styles.awayTagText,
                ]}
              >
                {fixture.isHome ? t("fixture.home") : t("fixture.away")}
              </Text>
            </View>
          </View>
          <Text style={styles.fixtureCompetition}>{fixture.competition}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  fixtureList: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  fixtureCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixtureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  fixtureContent: {
    flex: 1,
    paddingRight: spacing.xl,
  },
  fixtureOpponent: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  fixtureVs: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginTop: spacing.xs / 2,
  },
  fixtureMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
  fixtureVenue: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  fixtureTag: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  fixtureTagText: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  homeTag: {
    backgroundColor: "rgba(15,169,88,0.15)",
    borderColor: "rgba(15,169,88,0.4)",
  },
  awayTag: {
    backgroundColor: "rgba(209,14,14,0.15)",
    borderColor: "rgba(209,14,14,0.4)",
  },
  homeTagText: {
    color: colors.primary,
  },
  awayTagText: {
    color: colors.accent,
  },
  fixtureCompetition: {
    color: colors.mutedText,
    marginTop: spacing.xs,
    fontFamily: typography.medium,
  },
});

export default FixtureList;
