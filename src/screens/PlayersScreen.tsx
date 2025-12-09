import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { players } from "../data/mockData";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const PlayersScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.screenTitle}>{t("archive.sectionLegends")}</Text>
        <Text style={styles.screenSubtitle}>
          {t("archive.sectionLegendsSubtitle")}
        </Text>

        {players.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.playerNumber}>#{p.number}</Text>
              <Pressable>
                <Ionicons name="star-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <Image
              source={p.image || require("../assets/footboll/1.jpg")}
              style={styles.playerImage}
            />

            <Text style={styles.playerName}>{p.name}</Text>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{p.position}</Text>
            </View>

            <View style={styles.statsRow}>
              <Stat label={t("stats.matches")} value={p.matches ?? "-"} />
              <Stat label={t("stats.goals")} value={p.goals ?? "-"} />
              <Stat label={t("stats.assists")} value={p.assists ?? "-"} />
              <Stat
                label={t("stats.rating")}
                value={p.rating ? `${p.rating}/10` : "-"}
              />
            </View>

            <View style={styles.metaGrid}>
              <Meta
                icon="walk"
                text={
                  p.foot === "Both"
                    ? t("archive.footBoth")
                    : p.foot === "Left"
                      ? t("archive.footLeft")
                      : t("archive.footRight")
                }
              />
              <Meta icon="male" text={`${p.height} m`} />
              <Meta icon="flash" text={`${p.age} ${t("years")}`} />
              <Meta icon="map" text={p.hometown || t("archive.contactUnknown")} />
            </View>

            <Text style={styles.bio}>{p.bio}</Text>

            <Text style={styles.label}>{t("strengths")}</Text>
            <View style={styles.tagRow}>
              {p.strengths.map((s) => (
                <View style={styles.tag} key={s}>
                  <Ionicons name="checkmark" size={14} color={colors.text} />
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>

            {p.career?.length ? (
              <>
                <Text style={styles.label}>{t("career")}</Text>
                <View style={styles.careerBox}>
                  {p.career.map((c, i) => (
                    <Text key={`${p.id}-car-${i}`} style={styles.careerText}>
                      • {c}
                    </Text>
                  ))}
                </View>
              </>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="heart" size={18} color={colors.text} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="share-social" size={18} color={colors.text} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses" size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Meta = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={14} color={colors.text} />
    <Text style={styles.metaChipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },

  screenTitle: { color: colors.text, fontSize: fontSizes.xl, fontFamily: typography.bold },
  screenSubtitle: { color: colors.mutedText, fontSize: fontSizes.md, marginBottom: spacing.sm },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  playerNumber: { color: colors.text, fontSize: fontSizes.lg, fontFamily: typography.bold },

  playerImage: { width: "100%", height: 230, borderRadius: 14, backgroundColor: "#111" },

  playerName: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontFamily: typography.bold,
    textAlign: "center",
  },
  positionBadge: {
    alignSelf: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  positionText: { color: colors.primary, fontFamily: typography.semiBold },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: fontSizes.lg, color: colors.text, fontFamily: typography.bold },
  statLabel: { fontSize: fontSizes.sm, color: colors.mutedText },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: {
    flexDirection: "row",
    gap: 4,
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaChipText: { color: colors.text, fontSize: fontSizes.sm },

  bio: { color: colors.mutedText, lineHeight: 20 },

  label: { color: colors.text, fontFamily: typography.semiBold, marginTop: spacing.sm },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: { color: colors.text, fontSize: fontSizes.sm },

  careerBox: { gap: 2 },
  careerText: { color: colors.mutedText, fontSize: fontSizes.sm },

  actionRow: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.sm },
  actionBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight },
});

export default PlayersScreen;
