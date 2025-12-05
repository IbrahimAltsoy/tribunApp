import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  fixtureData,
  liveMatch,
  standings,
  LiveEvent,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const FixtureScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, "#0A0A0A", colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>Maç Merkezi</Text>
          <Text style={styles.pageSubtitle}>
            Fikstür, canlı olaylar ve puan durumu
          </Text>

          <LiveMatchCard />

          <SectionHeader
            title="Yaklaşan Maçlar"
            icon={<Ionicons name="calendar-outline" size={18} color={colors.text} />}
          />
          <View style={styles.fixtureList}>
            {fixtureData.map((item) => (
              <View key={item.id} style={styles.fixtureCard}>
                <View style={styles.fixtureRow}>
                  <View>
                    <Text style={styles.fixtureTeams}>Amedspor vs {item.opponent}</Text>
                    <Text style={styles.fixtureMeta}>
                      {item.date} • {item.time}
                    </Text>
                    <Text style={styles.fixtureMeta}>{item.venue}</Text>
                    <Text style={styles.fixtureCompetition}>{item.competition}</Text>
                  </View>
                  <View
                    style={[
                      styles.fixtureBadge,
                      { backgroundColor: item.isHome ? "#12381f" : "#2d1111" },
                    ]}
                  >
                    <Text style={styles.fixtureBadgeText}>
                      {item.isHome ? "İç Saha" : "Deplasman"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <SectionHeader
            title="Puan Durumu"
            icon={<Feather name="bar-chart-2" size={18} color={colors.text} />}
          />
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableText, styles.tableColTeam]}>Takım</Text>
              <Text style={styles.tableText}>O</Text>
              <Text style={styles.tableText}>A</Text>
              <Text style={styles.tableText}>Y</Text>
              <Text style={styles.tableText}>P</Text>
            </View>
            {standings.map((row) => (
              <View key={row.team} style={styles.tableRow}>
                <View style={styles.teamCell}>
                  <Text
                    style={[
                      styles.tableText,
                      row.team === "Amedspor" && styles.highlight,
                    ]}
                  >
                    {row.pos}. {row.team}
                  </Text>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((row.pts / 40) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.tableText}>{row.mp}</Text>
                <Text style={styles.tableText}>{row.gf}</Text>
                <Text style={styles.tableText}>{row.ga}</Text>
                <Text style={[styles.tableText, styles.highlight]}>{row.pts}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const SectionHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>{icon}</View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const LiveMatchCard = () => (
  <View style={styles.liveCard}>
    <View style={styles.liveHeader}>
      <View style={styles.liveBadge}>
        <Text style={styles.liveBadgeText}>{liveMatch.status}</Text>
      </View>
      <Text style={styles.liveMinute}>{liveMatch.minute}'</Text>
    </View>
    <View style={styles.liveScoreRow}>
      <Text style={styles.liveTeam}>Amedspor</Text>
      <Text style={styles.liveScore}>{liveMatch.score}</Text>
      <Text style={styles.liveTeam}>{liveMatch.away}</Text>
    </View>
    <View style={styles.eventList}>
      {liveMatch.events.map((event: LiveEvent) => (
        <View key={event.id} style={styles.eventRow}>
          <View style={styles.eventMinute}>
            <Text style={styles.eventMinuteText}>{event.minute}'</Text>
          </View>
          <View
            style={[
              styles.eventType,
              event.type === "goal" && { backgroundColor: "#12381f" },
              event.type === "card" && { backgroundColor: "#3a1a1a" },
            ]}
          >
            <Text style={styles.eventTypeText}>{event.type.toUpperCase()}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Text style={styles.eventPlayer}>{event.player}</Text>
            <Text style={styles.eventDesc}>{event.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  pageTitle: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginTop: spacing.lg,
  },
  pageSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginBottom: spacing.lg,
  },
  liveCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  liveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 14,
  },
  liveBadgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  liveMinute: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  liveScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveTeam: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
  },
  liveScore: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
  },
  eventList: {
    gap: spacing.sm,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  eventMinute: {
    width: 48,
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
  },
  eventMinuteText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  eventType: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
  },
  eventTypeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  eventDetail: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  eventPlayer: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  eventDesc: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
  },
  fixtureList: {
    gap: spacing.sm,
  },
  fixtureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixtureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  fixtureTeams: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  fixtureMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  fixtureCompetition: {
    color: colors.text,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
  fixtureBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  fixtureBadgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  table: {
    marginTop: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableText: {
    color: colors.text,
    fontFamily: typography.medium,
    width: 32,
    textAlign: "center",
  },
  tableColTeam: {
    width: "45%",
    textAlign: "left",
  },
  teamCell: {
    width: "45%",
    gap: spacing.xs / 2,
  },
  progressBackground: {
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
  },
  highlight: {
    color: colors.primary,
  },
});

export default FixtureScreen;
