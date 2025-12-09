import React, { memo, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { archiveHighlights } from "../data/mockData";

import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

/* ================= HERO ================= */

const ArchiveHero = memo(({ onBack }: { onBack?: () => void }) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[colors.primary, "rgba(15,169,88,0.07)", colors.card]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={heroStyles.container}
    >
      <View style={heroStyles.topRow}>
        <Pressable onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>

        {/* Logo alanı istersen kulüp logosu koyulabilir */}
        <MaterialCommunityIcons
          name="shield-star-outline"
          size={28}
          color={colors.text}
        />
      </View>

      <Text style={heroStyles.title}>{t("archive.sectionArchive")}</Text>
      <Text style={heroStyles.subtitle}>
        {t("archive.sectionArchiveSubtitle")}
      </Text>
    </LinearGradient>
  );
});

/* ================= HIGHLIGHT CARD ================= */

interface HighlightCardProps {
  title: string;
  detail: string;
  icon?: string;
}

const HighlightCard = memo(({ title, detail, icon }: HighlightCardProps) => (
  <View style={cardStyles.container}>
    <MaterialCommunityIcons
      name={"bookmark-outline"}
      size={22}
      color={colors.primary}
      style={{ marginBottom: 2 }}
    />

    <Text style={cardStyles.title}>{title}</Text>
    <Text style={cardStyles.body}>{detail}</Text>
  </View>
));

/* ================= SECTION ================= */

const Section = memo(
  ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: string;
  }) => (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.sectionHeader}>
        {icon && (
          <MaterialCommunityIcons
            name={"trophy-outline"}
            size={24}
            color={colors.primary}
          />
        )}
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  )
);

/* ================= MAIN ================= */

const ArchiveScreen = () => {
  const { t } = useTranslation();

  const listContainer = useMemo(
    () => ({
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
      gap: spacing.xl,
    }),
    []
  );

  return (
    <SafeAreaView style={screen.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={listContainer}
      >
        <ArchiveHero />

        <Section title={t("archive.milestones")} icon="flag-checkered">
          {archiveHighlights.map((item, i) => (
            <HighlightCard
              key={item.id}
              title={item.title}
              detail={item.detail}
              icon={i % 2 == 0 ? "bullhorn" : "trophy-outline"}
            />
          ))}
        </Section>

        <Section title={t("archive.honors")} icon="medal">
          <HighlightCard
            title={t("archive.honors")}
            detail={t("archive.honorsPlaceholder")}
            icon="star-four-points-outline"
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ================= STYLES ================= */

const screen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const heroStyles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: 20,
    minHeight: Dimensions.get("window").height * 0.18,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});

const cardStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
    ...shadows.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  body: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
});

export default ArchiveScreen;
