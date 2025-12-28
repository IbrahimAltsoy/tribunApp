import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Pressable,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { openURLSafely } from "../../utils/urlValidator";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { footballService } from "../../services/footballService";
import type { ClipContentDto } from "../../types/football";

const IS_IOS = Platform.OS === "ios";

type LiveTickerProps = {
  onPressMore?: () => void;
};

const LiveTicker: React.FC<LiveTickerProps> = ({ onPressMore }) => {
  const { t } = useTranslation();
  const [clips, setClips] = useState<ClipContentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const moreCardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    try {
      const response = await footballService.getClipContents();
      if (response.success && response.data) {
        setClips(response.data);
      }
    } catch (error) {
      console.log("Error loading clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMorePressIn = () => {
    Animated.spring(moreCardScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleMorePressOut = () => {
    Animated.spring(moreCardScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (clips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("home.liveTicker.noVideos") || "Henüz video yok"}</Text>
      </View>
    );
  }

  const visibleClips = clips.slice(0, 5);
  const hasMore = clips.length > 5;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToInterval={316}
      snapToAlignment="start"
    >
      {visibleClips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}

      {/* More Videos Card */}
      {hasMore && onPressMore && (
        <Pressable
          onPress={onPressMore}
          onPressIn={handleMorePressIn}
          onPressOut={handleMorePressOut}
        >
          <Animated.View
            style={[
              styles.moreCard,
              { transform: [{ scale: moreCardScale }] },
            ]}
          >
            <BlurView
              intensity={IS_IOS ? 25 : 20}
              tint="dark"
              style={styles.moreBlur}
            >
              <View style={styles.moreIconWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moreIconGradient}
                >
                  <Ionicons name="play-circle" size={32} color={colors.white} />
                </LinearGradient>
              </View>
              <Text style={styles.moreTitle}>{t("home.liveTicker.moreVideos")}</Text>
              <Text style={styles.moreSubtitle}>{t("home.liveTicker.video")}</Text>
              <Text style={styles.moreCount}>
                {t("home.liveTicker.videoCount", { count: clips.length - 5 })}
              </Text>
            </BlurView>
          </Animated.View>
        </Pressable>
      )}
    </ScrollView>
  );
};

const ClipCard = ({ clip }: { clip: ClipContentDto }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Determine URL to open: ExternalUrl for redirects, VideoUrl for playback
  const urlToOpen = clip.externalUrl || clip.videoUrl;

  // Get thumbnail (use default if not provided)
  const thumb = clip.thumbnailUrl
    ? { uri: clip.thumbnailUrl }
    : require("../../assets/footboll/1.jpg");

  const handlePress = () => {
    if (urlToOpen) {
      openURLSafely(urlToOpen, {
        errorTitle: "Error",
        invalidUrlMessage: "Cannot open this video",
      });
    }
  };

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

  const platformIcon = (() => {
    switch (clip.platform) {
      case "youtube":
      case "bein":
      case "trt":
        return "logo-youtube";
      case "x":
        return "logo-twitter";
      case "instagram":
        return "logo-instagram";
      default:
        return "play-outline";
    }
  })();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Title */}
      <Text style={styles.caption} numberOfLines={2}>
        {clip.title}
      </Text>

      {/* Video Thumbnail with Glassmorphism */}
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!urlToOpen}
        style={styles.videoContainer}
      >
        <ImageBackground
          source={thumb}
          style={styles.videoBox}
          imageStyle={styles.videoImage}
        >
          {/* Dark Gradient Overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Source Pills Row */}
          <View style={styles.sourceRow}>
            <BlurView
              intensity={IS_IOS ? 30 : 20}
              tint="dark"
              style={styles.sourcePill}
            >
              <Ionicons
                name={platformIcon as any}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.sourceText}>
                {clip.provider || clip.platform.toUpperCase()}
              </Text>
            </BlurView>

            {/* Play Icon */}
            {urlToOpen && (
              <View style={styles.playIconWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playIconGradient}
                >
                  <Ionicons name="play" size={16} color={colors.white} />
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Video Info */}
          {clip.description && (
            <View style={styles.videoInfo}>
              <Text style={styles.clipNote} numberOfLines={2}>
                {clip.description}
              </Text>
            </View>
          )}
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },

  loadingContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },

  emptyText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    textAlign: "center",
  },

  // Card Styles
  card: {
    width: 300,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    gap: spacing.sm,
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

  // Caption
  caption: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },

  // Video Container
  videoContainer: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  videoBox: {
    height: 180,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  videoImage: {
    borderRadius: radii.lg,
  },

  // Source Row
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  sourceText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.3,
  },

  // Play Icon
  playIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Video Info
  videoInfo: {
    gap: spacing.xs,
  },
  clipNote: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },

  // More Card Styles
  moreCard: {
    width: 180,
    height: 240,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  moreBlur: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.6)",
  },
  moreIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    marginBottom: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  moreIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moreTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    textAlign: "center",
  },
  moreSubtitle: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    textAlign: "center",
  },
  moreCount: {
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
});

export default LiveTicker;
