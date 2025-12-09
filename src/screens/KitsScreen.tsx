import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { kits } from "../data/mockData";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const KitsScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("archive.sectionKits")}</Text>
        <Text style={styles.subtitle}>{t("archive.sectionKitsSubtitle")}</Text>

        {kits.map((kit) => (
          <LinearGradient
            key={kit.id}
            colors={["rgba(15,169,88,0.25)", "rgba(209,14,14,0.1)"]}
            style={styles.card}
          >
            <View style={styles.headerRow}>
              <View style={styles.badge}>
                <Ionicons name="shirt-outline" size={16} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.season}>{kit.season}</Text>
                <Text style={styles.titleText}>{kit.title}</Text>
              </View>
            </View>
            <Text style={styles.palette}>{kit.palette}</Text>
            <Text style={styles.note}>{kit.note}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    padding: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  season: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  titleText: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  palette: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  note: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
});

export default KitsScreen;

