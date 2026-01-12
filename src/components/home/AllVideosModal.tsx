import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ImageBackground,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { openURLSafely } from "../../utils/urlValidator";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";

const IS_IOS = Platform.OS === "ios";

type LiveEvent = {
  id: string;
  minute: number;
  team: "home" | "away";
  type: "goal" | "card" | "var" | "sub";
  player: string;
  detail: string;
  videoUrl?: string;
  thumbUrl?: string;
};

type AllVideosModalProps = {
  visible: boolean;
  onClose: () => void;
  events?: LiveEvent[]; // Optional events array
};

const AllVideosModal: React.FC<AllVideosModalProps> = ({
  visible,
  onClose,
  events = [], // Default to empty array
}) => {
  const { t } = useTranslation();

  const renderVideoItem = ({ item }: { item: LiveEvent }) => {
    const thumb =
      item.thumb ||
      (item.thumbUrl
        ? { uri: item.thumbUrl }
        : require("../../assets/footboll/1.jpg"));
    const clipUrl = item.clip?.embedUrl || item.clip?.url || item.videoUrl;

    const handleVideoPress = () => {
      if (clipUrl) {
        openURLSafely(clipUrl, {
          errorTitle: t("error"),
          invalidUrlMessage: t("validation.urlBlocked"),
        });
      }
    };

    const platformIcon = (() => {
      switch (item.clip?.platform) {
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
      switch (item.clip?.platform) {
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
      switch (item.type) {
        case "goal":
          return {
            icon: "football" as const,
            color: colors.primary,
          };
        case "card":
          return {
            icon: "warning" as const,
            color: colors.accent,
          };
        default:
          return {
            icon: "sparkles" as const,
            color: colors.white,
          };
      }
    })();

    return (
      <Pressable
        onPress={handleVideoPress}
        style={({ pressed }) => [
          styles.videoItem,
          pressed && { opacity: 0.9 },
        ]}
      >
        <ImageBackground
          source={thumb}
          style={styles.videoThumb}
          imageStyle={styles.videoThumbImage}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Row: Badge + Platform */}
          <View style={styles.videoTopRow}>
            <BlurView
              intensity={IS_IOS ? 25 : 18}
              tint="dark"
              style={styles.typeBadge}
            >
              <Ionicons
                name={eventTypeConfig.icon}
                size={14}
                color={eventTypeConfig.color}
              />
              <Text style={[styles.typeText, { color: eventTypeConfig.color }]}>
                {item.type.toUpperCase()}
              </Text>
            </BlurView>

            <BlurView
              intensity={IS_IOS ? 25 : 18}
              tint="dark"
              style={styles.platformBadge}
            >
              <Ionicons name={platformIcon as any} size={12} color={colors.primary} />
              <Text style={styles.platformText}>{platformLabel}</Text>
            </BlurView>
          </View>

          {/* Bottom: Video Info */}
          <View style={styles.videoInfo}>
            <View style={styles.videoInfoRow}>
              <View style={styles.videoInfoText}>
                <Text style={styles.videoPlayer}>{item.player}</Text>
                <Text style={styles.videoDetail}>{item.detail}</Text>
              </View>
              <View style={styles.minuteBadge}>
                <Text style={styles.minuteText}>{item.minute}'</Text>
              </View>
            </View>

            {clipUrl && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={14} color={colors.white} />
                <Text style={styles.playText}>{t("home.liveTicker.playButton")}</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <BlurView intensity={95} tint="dark" style={styles.blurContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name="play-circle" size={24} color={colors.white} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.headerTitle}>{t("home.liveTicker.allVideosTitle")}</Text>
                <Text style={styles.headerSubtitle}>
                  {t("home.liveTicker.videoCountTitle", { count: events.length })}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <BlurView
                intensity={IS_IOS ? 20 : 15}
                tint="dark"
                style={styles.closeBlur}
              >
                <Ionicons name="close" size={24} color={colors.white} />
              </BlurView>
            </Pressable>
          </View>

          {/* Video List */}
          <FlatList
            data={events}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </BlurView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  blurContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
  },
  closeButton: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  closeBlur: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
  },

  // List
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Video Item
  videoItem: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoThumb: {
    height: 200,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  videoThumbImage: {
    borderRadius: radii.xl,
  },

  // Top Row
  videoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
    overflow: "hidden",
  },
  typeText: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(19, 30, 19, 0.5)",
    overflow: "hidden",
  },
  platformText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
  },

  // Video Info
  videoInfo: {
    gap: spacing.sm,
  },
  videoInfoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  videoInfoText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  videoPlayer: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  videoDetail: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  minuteBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
  },
  minuteText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
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
  playText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },
});

export default AllVideosModal;
