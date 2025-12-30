import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { kitService, type KitItem } from "../services/kitService";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

type GenderTeam = "mens" | "womens";

const KitsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<GenderTeam>("mens");
  const [kits, setKits] = useState<KitItem[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadKits = async () => {
      const teamType = selectedGender === "mens" ? "Mens" : "Womens";
      const response = await kitService.getKits(teamType);

      if (!isActive) {
        return;
      }

      if (response.success && response.data) {
        setKits(response.data);
      } else {
        setKits([]);
      }
    };

    loadKits();

    return () => {
      isActive = false;
    };
  }, [selectedGender]);

  const handleShare = useCallback(async (kit: KitItem) => {
    const message = `${kit.title} • ${kit.season}`;
    try {
      await Share.share({ message });
    } catch {
      // Ignore share errors to keep UX smooth.
    }
  }, []);

  const renderKitCard: ListRenderItem<KitItem> = useCallback(({ item: kit }) => (
    <LinearGradient
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

      <KitArt image={kit.image} colors={kit.colors} />

      <Text style={styles.kitTitle}>{kit.title}</Text>

      {kit.colors?.length ? (
        <View style={styles.colorDots}>
          {kit.colors.map((clr: string) => (
            <View key={clr} style={[styles.colorDot, { backgroundColor: clr }]} />
          ))}
        </View>
      ) : null}

      <Text style={styles.note}>{kit.note}</Text>

      <Pressable
        style={styles.shareButton}
        onPress={() => handleShare(kit)}
      >
        <Ionicons name="share-social-outline" size={16} color={colors.text} />
        <Text style={styles.shareButtonText}>{t("share")}</Text>
      </Pressable>
    </LinearGradient>
  ), [handleShare, t]);

  const keyExtractor = useCallback((item: KitItem) => item.id, []);

  const genderSelector = useMemo(() => (
    <View style={styles.genderSelector}>
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === "mens" && styles.genderButtonActive,
        ]}
        onPress={() => setSelectedGender("mens")}
      >
        <Text
          style={[
            styles.genderButtonText,
            selectedGender === "mens" && styles.genderButtonTextActive,
          ]}
        >
          {t("team.genderSelector.mens")}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.genderButton,
          selectedGender === "womens" && styles.genderButtonActive,
        ]}
        onPress={() => setSelectedGender("womens")}
      >
        <Text
          style={[
            styles.genderButtonText,
            selectedGender === "womens" && styles.genderButtonTextActive,
          ]}
        >
          {t("team.genderSelector.womens")}
        </Text>
      </Pressable>
    </View>
  ), [selectedGender, t]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <Text style={styles.title}>{t("archive.sectionKits")}</Text>
      <Text style={styles.subtitle}>{t("archive.sectionKitsSubtitle")}</Text>
      {genderSelector}
    </>
  ), [genderSelector, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={kits}
        renderItem={renderKitCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={4}
      />
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

  genderSelector: {
    flexDirection: "row",
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xs,
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
  },
  genderButtonTextActive: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },

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
    height: 190,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  kitPlaceholder: {
    width: "100%",
    height: 190,
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

  shareButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  shareButtonText: { color: colors.text, fontSize: fontSizes.sm },
});

export default KitsScreen;
