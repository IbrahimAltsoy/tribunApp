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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { kits } from "../data/mockData";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const KitsScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{t("archive.sectionKits")}</Text>
        <Text style={styles.subtitle}>{t("archive.sectionKitsSubtitle")}</Text>

        {kits.map((kit) => (
          <LinearGradient
            key={kit.id}
            colors={["rgba(15,169,88,0.20)", "rgba(0,0,0,0.30)", "rgba(209,14,14,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.headerRow}>
              <View style={styles.seasonBadge}>
                <Ionicons name="shirt" size={16} color={colors.text} />
                <Text style={styles.seasonText}>{kit.season}</Text>
              </View>

              <Pressable style={styles.iconButton}>
                <Ionicons name="star-outline" size={18} color={colors.text} />
              </Pressable>
            </View>

            <KitArt image={kit.image} colors={(kit as any).colors} />

            <Text style={styles.kitTitle}>{kit.title}</Text>

            {(kit as any).colors?.length ? (
              <View style={styles.colorDots}>
                {(kit as any).colors.map((clr: string) => (
                  <View key={clr} style={[styles.colorDot, { backgroundColor: clr }]} />
                ))}
              </View>
            ) : null}

            <Text style={styles.note}>{kit.note}</Text>

            <View style={styles.actionRow}>
              <Action icon="heart-outline" label={t("like")} />
              <Action icon="share-social-outline" label={t("share")} />
              <Action icon="ellipsis-horizontal" label={t("details")} />
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const KitArt = ({
  image,
  colors: palette,
}: {
  image?: any;
  colors?: string[];
}) => {
  if (image) {
    return <Image source={image} style={styles.kitImage} />;
  }

  const cols = palette && palette.length ? palette : ["#0FA958", "#D10E0E"];
  return (
    <View style={styles.kitPlaceholder}>
      {cols.slice(0, 4).map((clr) => (
        <View key={clr} style={[styles.kitStripe, { backgroundColor: clr }]} />
      ))}
    </View>
  );
};

const Action = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <Pressable style={styles.actionBtn}>
    <Ionicons name={icon} size={16} color={colors.text} />
    <Text style={styles.actionText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 1.5 },

  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  subtitle: { color: colors.mutedText, fontFamily: typography.medium, lineHeight: 22, marginBottom: spacing.sm },

  card: {
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  seasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  seasonText: { color: colors.text, fontFamily: typography.semiBold, fontSize: fontSizes.sm },

  iconButton: { padding: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.borderLight },

  kitImage: {
    width: "100%",
    height: 230,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  kitPlaceholder: {
    width: "100%",
    height: 230,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  kitStripe: { flex: 1 },

  kitTitle: {
    color: colors.primary,
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    textAlign: "center",
  },

  colorDots: { flexDirection: "row", gap: 8, alignSelf: "center" },
  colorDot: { width: 18, height: 18, borderRadius: 999, borderWidth: 1, borderColor: "#fff" },

  note: { color: colors.mutedText, fontFamily: typography.medium, lineHeight: 20, textAlign: "center" },

  actionRow: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.sm },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionText: { color: colors.text, fontSize: fontSizes.sm },
});

export default KitsScreen;
