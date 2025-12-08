// --- KODUN TAMAMI (kopyala & yapıştır) ---
import React from "react";
import { ScrollView, StyleSheet, Text, View, TextStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  fixtureData,
  liveMatch,
  standings,
  LiveEvent,
  StandingRow,
  FixtureItem,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

/*────────────────────────────────────────────────────
 🏆 PUAN TABLO SATIRI
────────────────────────────────────────────────────*/
const StandingRowComponent = ({
  row,
  index,
  total,
}: {
  row: StandingRow;
  index: number;
  total: number;
}) => {
  const status =
    index < 2
      ? "promotion"
      : index < 6
      ? "playoff"
      : index >= total - 4
      ? "relegation"
      : "normal";

  const isAmed = row.team.toLowerCase() === "amedspor";

  return (
    <View style={styles.tableRow}>
      <View style={styles.teamCell}>
        {/* 🎨 renk sadece burada */}
        <View
          style={[
            styles.rankPill,
            status === "promotion" && styles.rankPromotion,
            status === "playoff" && styles.rankPlayoff,
            status === "relegation" && styles.rankRelegation,
            isAmed && styles.rankAmed, // 🔥 özel
          ]}
        >
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <Text style={[styles.tableText, styles.teamName]} numberOfLines={1}>
          {row.team}
        </Text>
      </View>

      <View style={styles.numCol}>
        <Text style={styles.tableText}>{row.mp}</Text>
      </View>
      <View style={styles.numCol}>
        <Text style={styles.tableText}>{row.gf}</Text>
      </View>
      <View style={styles.numCol}>
        <Text style={styles.tableText}>{row.ga}</Text>
      </View>
      <View style={[styles.numCol, { width: 40 }]}>
        <Text style={[styles.tableText, { fontFamily: typography.bold }]}>
          {row.pts}
        </Text>
      </View>
    </View>
  );
};

/*───────────────────────────────
  Fixture - Live Components (Aynı)
────────────────────────────────*/

const FixtureCard = ({ item, t }: { item: FixtureItem; t: TFunction }) => (
  <View style={styles.fixtureCard}>
    <View style={styles.fixtureTopRow}>
      <View style={[styles.pillPrimary, !item.isHome && styles.pillAway]}>
        <Ionicons
          name={item.isHome ? "home-outline" : "airplane-outline"}
          size={14}
          color={colors.text}
        />
        <Text style={styles.pillText}>
          {item.isHome ? t("fixture.home") : t("fixture.away")}
        </Text>
      </View>
      <View style={styles.pillGhost}>
        <Ionicons name="time-outline" size={14} color={colors.text} />
        <Text style={styles.pillText}>{item.time}</Text>
      </View>
    </View>
    <Text style={styles.fixtureTeams}>
      {t("fixture.vs", { home: "Amedspor", away: item.opponent })}
    </Text>
    <Text style={styles.fixtureMeta}>{item.date}</Text>
    <Text style={styles.fixtureVenue}>{item.venue}</Text>
    <Text style={styles.fixtureCompetition}>{item.competition}</Text>
  </View>
);

const LiveEventRow = ({ event }: { event: LiveEvent }) => {
  let tag = styles.defaultEventTag,
    color = colors.text;
  if (event.type === "goal") {
    tag = styles.goalTag;
    color = colors.primary;
  }
  if (event.type === "card") {
    tag = styles.cardTag;
    color = colors.accent;
  }
  if (event.type === "var") {
    tag = styles.varTag;
    color = colors.info;
  }

  return (
    <View style={styles.eventRow}>
      <View style={styles.eventMinute}>
        <Text style={styles.eventMinuteText}>{event.minute}'</Text>
      </View>
      <View style={[styles.eventType, tag]}>
        <Text style={[styles.eventTypeText, { color }]}>
          {event.type.toUpperCase()}
        </Text>
      </View>
      <View style={styles.eventDetail}>
        <Text style={styles.eventPlayer}>{event.player}</Text>
        <Text style={styles.eventDesc}>{event.detail}</Text>
      </View>
    </View>
  );
};

const LiveMatchCard = ({ t }: { t: TFunction }) => (
  <LinearGradient colors={["#12381f", "#0d0d0d"]} style={styles.liveCard}>
    <View style={styles.liveHeader}>
      <View style={styles.liveBadge}>
        <Ionicons name="radio-outline" size={14} color={colors.text} />
        <Text style={styles.liveBadgeText}>{liveMatch.status}</Text>
      </View>
      <Text style={styles.liveMinute}>{liveMatch.minute}'</Text>
    </View>
    <View style={styles.liveScoreRow}>
      <Text style={styles.liveScoreLine} numberOfLines={1}>
        <Text style={[styles.liveTeam, styles.liveTeamLeft]}>Amedspor</Text>
        <Text style={styles.liveScoreInline}>{`  ${liveMatch.score}  `}</Text>
        <Text style={[styles.liveTeam, styles.liveTeamRight]}>
          {liveMatch.away}
        </Text>
      </Text>
    </View>
    <View style={styles.teamSubRow}>
      <Text style={styles.teamSub}>{t("fixture.home")}</Text>
      <Text style={[styles.teamSub, { textAlign: "right" }]}>
        {t("fixture.guest")}
      </Text>
    </View>
    <View style={styles.eventList}>
      {liveMatch.events.map((e) => (
        <LiveEventRow key={e.id} event={e} />
      ))}
    </View>
  </LinearGradient>
);

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

/*───────────────────────────────
  ANA EKRAN
────────────────────────────────*/
const FixtureScreen = () => {
  const { t } = useTranslation();
  const sortedStandings = [...standings].sort((a, b) => b.pts - a.pts);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>{t("fixture.title")}</Text>
          <Text style={styles.pageSubtitle}>{t("fixture.subtitle")}</Text>

          <LiveMatchCard t={t} />

          <SectionHeader
            title={t("fixture.tableTitle")}
            icon={<Feather name="bar-chart-2" size={18} color={colors.text} />}
          />

          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[styles.tableTextHeader, styles.tableColTeamHeader]}
                >
                  {t("fixture.tableTeam")}
                </Text>
                <View style={styles.numCol}>
                  <Text style={styles.tableTextHeader}>O</Text>
                </View>
                <View style={styles.numCol}>
                  <Text style={styles.tableTextHeader}>A</Text>
                </View>
                <View style={styles.numCol}>
                  <Text style={styles.tableTextHeader}>Y</Text>
                </View>
                <View style={[styles.numCol, { width: 40 }]}>
                  <Text style={styles.tableTextHeader}>P</Text>
                </View>
              </View>

              {sortedStandings.map((row, i) => (
                <StandingRowComponent
                  key={row.team}
                  row={row}
                  index={i}
                  total={sortedStandings.length}
                />
              ))}
            </View>
          </ScrollView>

          <SectionHeader
            title={t("fixture.upcomingTitle")}
            icon={
              <Ionicons name="calendar-outline" size={18} color={colors.text} />
            }
          />
          <View style={styles.fixtureGrid}>
            {fixtureData.map((x) => (
              <FixtureCard key={x.id} item={x} t={t} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
export default FixtureScreen;

/*────────────────────────────────────────────────────
  STİLLER — TEK BLOK
────────────────────────────────────────────────────*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
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

  liveCard: {
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveBadgeText: { color: colors.text, fontFamily: typography.semiBold },
  liveMinute: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  liveScoreRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  teamSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs / 2,
  },
  liveScoreLine: {
    flex: 1,
    textAlign: "center",
  },
  liveTeam: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  liveTeamLeft: { textAlign: "left" },
  liveTeamRight: { textAlign: "right" },
  liveScoreInline: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  teamSub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  eventList: { gap: spacing.sm },

  eventRow: { flexDirection: "row", gap: spacing.sm },
  eventMinute: {
    width: 52,
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
  },
  eventMinuteText: { color: colors.text, fontFamily: typography.semiBold },
  eventType: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  defaultEventTag: { backgroundColor: colors.borderLight },
  goalTag: {
    backgroundColor: "rgba(15,169,88,0.2)",
    borderWidth: 1,
    borderColor: "rgba(15,169,88,0.4)",
  },
  cardTag: {
    backgroundColor: "rgba(209,14,14,0.2)",
    borderWidth: 1,
    borderColor: "rgba(209,14,14,0.4)",
  },
  varTag: {
    backgroundColor: "rgba(59,130,246,0.2)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.4)",
  },
  eventTypeText: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  } as TextStyle,
  eventDetail: { flex: 1, gap: spacing.xs / 2 },
  eventPlayer: { color: colors.text, fontFamily: typography.semiBold },
  eventDesc: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },

  /*🔹 PUAN TABLOSU */
  table: {
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  tableText: { color: colors.text, fontFamily: typography.medium },
  tableTextHeader: {
    color: colors.mutedText,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  tableColTeamHeader: { width: 150, marginLeft: 40 },
  numCol: { width: 36, alignItems: "center" },

  teamCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: 180,
  },
  teamName: { fontFamily: typography.semiBold },

  /* 🎨 Rank pill rengimiz */
  rankPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { color: "#fff", fontFamily: typography.bold },

  rankPromotion: { backgroundColor: colors.primary },
  rankPlayoff: { backgroundColor: "#0d6efd" },
  rankRelegation: { backgroundColor: colors.accent },

  /* 🌟 Amed Özel */
  rankAmed: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  /* Fikstür */
  fixtureGrid: { gap: spacing.sm },
  fixtureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  fixtureTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pillPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    backgroundColor: "rgba(15,169,88,0.18)",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderWidth: 1,
    borderColor: "rgba(15,169,88,0.4)",
  },
  pillAway: {
    backgroundColor: "rgba(230,57,57,0.18)",
    borderColor: colors.accentLight,
  },
  pillGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  fixtureTeams: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginTop: spacing.xs,
  },
  fixtureMeta: { color: colors.mutedText, fontFamily: typography.medium },
  fixtureVenue: { color: colors.mutedText, fontFamily: typography.medium },
  fixtureCompetition: {
    color: colors.text,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
});

