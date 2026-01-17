import React, { memo, useMemo, useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

/* ================= ARCHIVE DATA ================= */

/**
 * Archive highlights - Historical milestones and achievements
 * This data is static and rarely changes, so it's kept locally
 * rather than fetched from API for better performance
 */
const archiveHighlights = [
  {
    id: "h1",
    title: "Diyarbakır'ın sesi",
    detail:
      "1932'den bugüne amatörden profesyonele uzanan yolculuk. Sur içi mahallelerinden yükselen tribün kültürü.",
  },
  {
    id: "h2",
    title: "Kupa koşusu",
    detail:
      "2024 Türkiye Kupası çeyrek finali, penaltılar ve ardından gelen tribün yürüyüşü.",
  },
  {
    id: "h3",
    title: "Deplasman ruhu",
    detail:
      "Anadolu şehirlerinde renkleriyle yankılanan taraftar kortejleri, dayanışma hikayeleri.",
  },
];

/* ================= HERO ================= */

const IS_IOS = Platform.OS === "ios";

const ArchiveHero = memo(() => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={[
        colors.primary,
        "rgba(0, 191, 71, 0.8)",
        "rgba(11, 17, 28, 0.9)",
        colors.background,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={heroStyles.container}
    >
      <BlurView
        intensity={IS_IOS ? 20 : 15}
        tint="dark"
        style={heroStyles.blurContainer}
      >
        <View style={heroStyles.topRow}>
          <MaterialCommunityIcons
            name="shield-star-outline"
            size={32}
            color={colors.primary}
          />
        </View>

        <Animated.Text
          style={[
            heroStyles.title,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {t("archive.sectionArchive")}
        </Animated.Text>
        <Animated.Text
          style={[
            heroStyles.subtitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {t("archive.sectionArchiveSubtitle")}
        </Animated.Text>
      </BlurView>
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
  <LinearGradient
    colors={[
      "rgba(0, 191, 71, 0.1)",
      "rgba(11, 17, 28, 0.8)",
      colors.card,
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={cardStyles.container}
  >
    <BlurView
      intensity={IS_IOS ? 8 : 6}
      tint="dark"
      style={cardStyles.blurContent}
    >
      <MaterialCommunityIcons
        name={"bookmark-outline"}
        size={22}
        color={colors.primary}
        style={{ marginBottom: 2 }}
      />

      <Text style={cardStyles.title}>{title}</Text>
      <Text style={cardStyles.body}>{detail}</Text>
    </BlurView>
  </LinearGradient>
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
      paddingTop: spacing.xl + spacing.lg,
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
    borderRadius: 24,
    minHeight: Dimensions.get("window").height * 0.2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blurContainer: {
    padding: spacing.xl,
    backgroundColor: "rgba(11, 17, 28, 0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.text,
    fontFamily: typography.medium,
    opacity: 0.88,
    lineHeight: 22,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  blurContent: {
    padding: spacing.md,
    backgroundColor: "rgba(11, 17, 28, 0.3)",
    gap: spacing.xs,
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
