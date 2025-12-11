import React, { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { openURLSafely } from "../../utils/urlValidator";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { liveMatch } from "../../data/mockData";

const IS_IOS = Platform.OS === "ios";

type LiveTickerProps = {
  onPressMore?: () => void;
};

const LiveTicker: React.FC<LiveTickerProps> = ({ onPressMore }) => {
  const { t } = useTranslation();
  const visibleEvents = liveMatch.events.slice(0, 5);
  const hasMore = liveMatch.events.length > 5;
  const moreCardScale = useRef(new Animated.Value(1)).current;

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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToInterval={316}
      snapToAlignment="start"
    >
      {visibleEvents.map((event) => (
        <LiveEventCard key={event.id} event={event} />
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
                {t("home.liveTicker.videoCount", { count: liveMatch.events.length - 5 })}
              </Text>
            </BlurView>
          </Animated.View>
        </Pressable>
      )}
    </ScrollView>
  );
};

const LiveEventCard = ({ event }: { event: (typeof liveMatch.events)[0] }) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const thumb =
    event.thumb ||
    (event.thumbUrl
      ? { uri: event.thumbUrl }
      : require("../../assets/footboll/1.jpg"));
  const clipUrl = event.clip?.embedUrl || event.clip?.url || event.videoUrl;

  const handleVideoPress = () => {
    if (clipUrl) {
      openURLSafely(clipUrl, {
        errorTitle: t("error"),
        invalidUrlMessage: t("validation.urlBlocked"),
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
    switch (event.clip?.platform) {
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

  const platformLabel = (() => {
    switch (event.clip?.platform) {
      case "bein":
        return "beIN SPORTS";
      case "trt":
        return "TRT Spor";
      case "youtube":
        return "YouTube";
      case "x":
        return "X (Twitter)";
      case "instagram":
        return "Instagram";
      default:
        return "Harici";
    }
  })();

  const eventTypeConfig = (() => {
    switch (event.type) {
      case "goal":
        return {
          icon: "football" as const,
          color: colors.primary,
          bgColor: "rgba(0, 191, 71, 0.15)",
          borderColor: colors.primary,
        };
      case "card":
        return {
          icon: "warning" as const,
          color: colors.accent,
          bgColor: "rgba(209, 14, 14, 0.15)",
          borderColor: colors.accent,
        };
      default:
        return {
          icon: "sparkles" as const,
          color: colors.white,
          bgColor: "rgba(255, 255, 255, 0.1)",
          borderColor: colors.glassStroke,
        };
    }
  })();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Card Header: Event Type Badge + Minute */}
      <View style={styles.cardHeader}>
        {/* <BlurView
          intensity={IS_IOS ? 20 : 15}
          tint="dark"
          style={[
            styles.badge,
            {
              backgroundColor: eventTypeConfig.bgColor,
              borderColor: eventTypeConfig.borderColor,
            },
          ]}
        >
          <Ionicons
            name={eventTypeConfig.icon}
            size={16}
            color={eventTypeConfig.color}
          />
          <Text style={[styles.badgeText, { color: eventTypeConfig.color }]}>
            {event.type.toUpperCase()}
          </Text>
        </BlurView> */}

        {/* Live Minute Indicator */}
        {/* <View style={styles.minuteBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.minute}>{event.minute}'</Text>
        </View> */}
      </View>

      {/* Event Caption */}
      <Text style={styles.caption} numberOfLines={2}>
        <Text style={styles.playerName}>{event.player}</Text>
        <Text style={styles.captionDetail}> • {event.detail}</Text>
      </Text>

      {/* Video Thumbnail with Glassmorphism */}
      <Pressable
        onPress={handleVideoPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!clipUrl}
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
              <Text style={styles.sourceText}>{platformLabel}</Text>
            </BlurView>

            {/* Play Icon */}
            {clipUrl && (
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
          <View style={styles.videoInfo}>
            <Text style={styles.clipTitle} numberOfLines={1}>
              Amedspor vs {liveMatch.away} • {event.minute}'
            </Text>
            <Text style={styles.clipNote} numberOfLines={2}>
              {event.clip?.note || "Video oynatmak için tıklayın"}
            </Text>
          </View>
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

  // Card Header
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  badgeText: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
  },

  // Live Minute Badge
  minuteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: "rgba(209, 14, 14, 0.15)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  minute: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },

  // Caption
  caption: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  playerName: {
    fontFamily: typography.bold,
    color: colors.white,
  },
  captionDetail: {
    color: colors.textSecondary,
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
  clipTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
