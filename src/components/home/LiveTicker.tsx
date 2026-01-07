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
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { openURLSafely } from "../../utils/urlValidator";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { footballService } from "../../services/footballService";
import { mediaService } from "../../services/mediaService";
import type { ClipContentDto } from "../../types/football";
import { logger } from "../../utils/logger";

const IS_IOS = Platform.OS === "ios";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type LiveTickerProps = {
  onPressMore?: () => void;
};

const LiveTicker: React.FC<LiveTickerProps> = ({ onPressMore }) => {
  const { t } = useTranslation();
  const [clips, setClips] = useState<ClipContentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClip, setSelectedClip] = useState<ClipContentDto | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
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
      logger.log("Error loading clips:", error);
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

  const handleClipPress = (clip: ClipContentDto) => {
    // If externalUrl exists, open in browser
    if (clip.externalUrl) {
      openURLSafely(clip.externalUrl, {
        errorTitle: t("error") || "Error",
        invalidUrlMessage: t("validation.urlBlocked") || "Cannot open this video",
      });
    } else if (clip.videoUrl) {
      // If only videoUrl exists, play in-app
      setSelectedClip(clip);
      setShowVideoPlayer(true);
    }
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedClip(null);
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
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={316}
        snapToAlignment="start"
      >
        {visibleClips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} onPress={() => handleClipPress(clip)} />
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

      {/* Video Player Modal */}
      {selectedClip && showVideoPlayer && (
        <VideoPlayerModal
          clip={selectedClip}
          visible={showVideoPlayer}
          onClose={handleCloseVideoPlayer}
        />
      )}
    </>
  );
};

type ClipCardProps = {
  clip: ClipContentDto;
  onPress: () => void;
};

const ClipCard: React.FC<ClipCardProps> = ({ clip, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  // Fetch signed URL for thumbnail
  useEffect(() => {
    const loadThumbnail = async () => {
      if (clip.thumbnailUrl) {
        const result = await mediaService.getSignedUrl(clip.thumbnailUrl);
        if (result.success && result.url) {
          setThumbnailUri(result.url);
        }
      }
    };

    loadThumbnail();
  }, [clip.thumbnailUrl]);

  // Get thumbnail (use signed URL if available, otherwise default)
  const thumb = thumbnailUri
    ? { uri: thumbnailUri }
    : require("../../assets/footboll/1.jpg");

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

  // Determine if video can be played
  const hasVideo = !!(clip.externalUrl || clip.videoUrl);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Title */}
      <Text style={styles.caption} numberOfLines={2}>
        {clip.title}
      </Text>

      {/* Video Thumbnail with Glassmorphism */}
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!hasVideo}
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
            {hasVideo && (
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

type VideoPlayerModalProps = {
  clip: ClipContentDto;
  visible: boolean;
  onClose: () => void;
};

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  clip,
  visible,
  onClose,
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch signed URL for video
  useEffect(() => {
    const loadVideo = async () => {
      if (clip.videoUrl) {
        setLoading(true);
        const result = await mediaService.getSignedUrl(clip.videoUrl);
        if (result.success && result.url) {
          setVideoUri(result.url);
        }
        setLoading(false);
      }
    };

    if (visible) {
      loadVideo();
    }
  }, [clip.videoUrl, visible]);

  useEffect(() => {
    return () => {
      // Cleanup: unload video when component unmounts
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (status?.isLoaded) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={["top"]}>
        <View style={styles.videoPlayerContainer}>
          {/* Header */}
          <View style={styles.videoHeader}>
            <Pressable onPress={onClose} style={styles.closeVideoButton}>
              <BlurView
                intensity={IS_IOS ? 20 : 15}
                tint="dark"
                style={styles.closeVideoBlur}
              >
                <Ionicons name="close" size={28} color={colors.white} />
              </BlurView>
            </Pressable>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {clip.title}
            </Text>
          </View>

          {/* Video Player */}
          <View style={styles.videoWrapper}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : videoUri ? (
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay
                onPlaybackStatusUpdate={(status) => setStatus(status)}
              />
            ) : (
              <Text style={{ color: colors.white, textAlign: "center" }}>
                Video yüklenemedi
              </Text>
            )}
          </View>

          {/* Video Info */}
          <View style={styles.videoDetails}>
            <BlurView
              intensity={IS_IOS ? 30 : 20}
              tint="dark"
              style={styles.videoDetailsBlur}
            >
              <View style={styles.platformRow}>
                <Ionicons
                  name={(() => {
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
                  })() as any}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.platformName}>
                  {clip.provider || clip.platform.toUpperCase()}
                </Text>
              </View>

              {clip.description && (
                <Text style={styles.videoDescription}>{clip.description}</Text>
              )}
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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

  // Video Player Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoPlayerContainer: {
    flex: 1,
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  closeVideoButton: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  closeVideoBlur: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
  },
  videoTitle: {
    flex: 1,
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16), // 16:9 aspect ratio
  },
  videoDetails: {
    padding: spacing.lg,
  },
  videoDetailsBlur: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
    overflow: "hidden",
    gap: spacing.md,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  platformName: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  videoDescription: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
});

export default LiveTicker;
