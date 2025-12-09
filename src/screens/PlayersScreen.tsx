import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { players } from "../data/mockData";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const PlayersScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("archive.sectionLegends")}</Text>
        <Text style={styles.subtitle}>
          {t("archive.sectionLegendsSubtitle")}
        </Text>

        {players.map((player) => (
          <View key={player.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{player.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{player.name}</Text>
                <Text style={styles.role}>{player.position}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="map" size={14} color={colors.text} />
                <Text style={styles.metaChipText}>
                  {player.hometown || t("archive.contactUnknown")}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Meta icon="body" text={`${player.height} m`} />
              <Meta icon="flash" text={`${player.age} ${t("archive.yearsOld")}`} />
              <Meta
                icon="walk-outline"
                text={
                  player.foot === "Both"
                    ? t("archive.footBoth")
                    : player.foot === "Left"
                      ? t("archive.footLeft")
                      : t("archive.footRight")
                }
              />
            </View>
            <Text style={styles.bio}>{player.bio}</Text>
            <View style={styles.tagRow}>
              {player.strengths.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.text} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Meta = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={14} color={colors.text} />
    <Text style={styles.metaChipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 22,
  },
  card: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(15,169,88,0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  name: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  role: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  metaChipText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  bio: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
});

export default PlayersScreen;

