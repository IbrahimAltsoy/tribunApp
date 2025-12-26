import React, { useRef } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import type { NewsDto } from "../../types/news";

const IS_IOS = Platform.OS === "ios";

type Props = {
  item: NewsDto;
  onPress?: (id: string) => void;
};

const NewsCard: React.FC<Props> = React.memo(({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const summary =
    item.summary.length > 65
      ? `${item.summary.slice(0, 65).trimEnd()}...`
      : item.summary;

  // Calculate time ago from publishedAt or createdAt
  const getTimeAgo = () => {
    const date = new Date(item.publishedAt || item.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} dakika`;
    if (diffHours < 24) return `${diffHours} saat`;
    return `${diffDays} gün`;
  };

  const categoryName = item.category?.name || "Haber";
  const categoryConfig = (() => {
    const cat = categoryName.toLowerCase();
    if (cat.includes("transfer") || cat.includes("kadro")) {
      return {
        icon: "people" as const,
        color: colors.primary,
        bgColor: "rgba(0, 191, 71, 0.2)",
      };
    }
    if (cat.includes("maç") || cat.includes("galibiyet") || cat.includes("gol")) {
      return {
        icon: "football" as const,
        color: colors.accent,
        bgColor: "rgba(209, 14, 14, 0.2)",
      };
    }
    return {
      icon: "newspaper" as const,
      color: colors.white,
      bgColor: "rgba(255, 255, 255, 0.15)",
    };
  })();

  const body = (
    <View style={styles.newsContent}>
      {/* Category Badge with Icon */}
      <BlurView
        intensity={IS_IOS ? 25 : 18}
        tint="dark"
        style={[styles.newsPill, { backgroundColor: categoryConfig.bgColor }]}
      >
        <Ionicons name={categoryConfig.icon} size={12} color={categoryConfig.color} />
        <Text style={[styles.newsPillText, { color: categoryConfig.color }]}>
          {categoryName.toUpperCase()}
        </Text>
      </BlurView>

      {/* Title */}
      <Text style={styles.newsTitle} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Summary */}
      <Text style={styles.newsSummary} numberOfLines={2}>
        {summary}
      </Text>

      {/* Meta Row */}
      <View style={styles.metaRow}>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.newsMeta}>{getTimeAgo()} önce</Text>
        </View>
        <View style={styles.arrowIcon}>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </View>
  );

  if (item.imageUrl || item.thumbnailUrl) {
    return (
      <Pressable
        onPress={() => onPress?.(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.newsCard, { transform: [{ scale: scaleAnim }] }]}>
          <ImageBackground
            source={{ uri: item.thumbnailUrl || item.imageUrl }}
            style={styles.newsImage}
            imageStyle={styles.newsImageStyle}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
              style={StyleSheet.absoluteFillObject}
            />
            {body}
          </ImageBackground>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.newsCard, styles.newsCardPlain, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={["rgba(0, 191, 71, 0.15)", "rgba(209, 14, 14, 0.08)", "rgba(19, 30, 19, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.newsImage}
        >
          {body}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  newsCard: {
    width: 280,
    height: 200,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  newsCardPlain: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  newsImage: {
    flex: 1,
  },
  newsImageStyle: {
    borderRadius: radii.xl,
  },
  newsContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "flex-end",
    gap: spacing.sm,
  },

  // Category Badge
  newsPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  newsPillText: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
  },

  // Title
  newsTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Summary
  newsSummary: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },

  // Meta Row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  newsMeta: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  arrowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 191, 71, 0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NewsCard;
