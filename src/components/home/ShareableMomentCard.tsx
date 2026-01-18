import React, { useRef, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import BihevraText from "../BihevraText";
import type { FanMomentDto } from "../../types/fanMoment";

type ShareableMomentCardProps = {
  moment: FanMomentDto;
};

export type ShareableMomentCardRef = {
  capture: () => Promise<string>;
};

/**
 * Paylaşılabilir moment kartı
 * ViewShot ile görüntü olarak yakalanır ve sosyal medyada paylaşılır
 */
const ShareableMomentCard = forwardRef<ShareableMomentCardRef, ShareableMomentCardProps>(
  ({ moment }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!viewShotRef.current) {
          throw new Error("ViewShot ref not available");
        }
        const uri = await viewShotRef.current.capture?.();
        if (!uri) {
          throw new Error("Failed to capture image");
        }
        return uri;
      },
    }));

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const hasMedia = moment.imageUrl || moment.videoUrl;

    return (
      <ViewShot
        ref={viewShotRef}
        options={{
          format: "png",
          quality: 1,
          result: "tmpfile",
        }}
        style={styles.viewShot}
      >
        <View style={styles.card}>
          {/* Media Section - Image veya Gradient Placeholder */}
          {hasMedia ? (
            <ImageBackground
              source={{ uri: moment.imageUrl || moment.videoUrl }}
              style={styles.mediaContainer}
              imageStyle={styles.mediaImage}
            >
              {/* Gradient overlay for better text visibility */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.mediaGradient}
              >
                {/* Bihevra Watermark */}
                <View style={styles.watermarkMedia}>
                  <BihevraText fontSize={18} variant="watermark" />
                </View>
              </LinearGradient>

              {/* Video indicator */}
              {moment.videoUrl && !moment.imageUrl && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="videocam" size={20} color={colors.white} />
                </View>
              )}
            </ImageBackground>
          ) : (
            // No media - show gradient placeholder with quote
            <LinearGradient
              colors={["#0FA958", "#131E13", "#D10E0E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderContainer}
            >
              {/* Large quote icon */}
              <View style={styles.quoteContainer}>
                <Ionicons name="chatbubble-ellipses" size={48} color="rgba(255,255,255,0.15)" />
              </View>

              {/* Caption in center if no media */}
              {moment.description && (
                <Text style={styles.placeholderCaption} numberOfLines={4}>
                  "{moment.description}"
                </Text>
              )}

              {/* Bihevra Watermark */}
              <View style={styles.watermarkPlaceholder}>
                <BihevraText fontSize={20} variant="watermark" />
              </View>
            </LinearGradient>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            {/* User Info Row */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {moment.username?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username} numberOfLines={1}>
                  @{moment.username}
                </Text>
                <Text style={styles.date}>{formatDate(moment.createdAt)}</Text>
              </View>
            </View>

            {/* Caption - only show here if there's media */}
            {hasMedia && moment.description && (
              <Text style={styles.caption} numberOfLines={2}>
                "{moment.description}"
              </Text>
            )}

            {/* Footer with branding */}
            <View style={styles.footer}>
              <View style={styles.tribunBadge}>
                <Ionicons name="football" size={14} color={colors.white} style={{ marginRight: 4 }} />
                <Text style={styles.tribunText}>Tribün App</Text>
              </View>
              <Text style={styles.tagline}>Taraftar Platformu</Text>
            </View>
          </View>
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  viewShot: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
  card: {
    width: 380,
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primary,
  },

  // Media styles
  mediaContainer: {
    width: "100%",
    height: 380,
    position: "relative",
    backgroundColor: colors.card,
  },
  mediaImage: {
    resizeMode: "cover",
  },
  mediaGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: spacing.md,
  },
  watermarkMedia: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  videoIndicator: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: spacing.xs,
    borderRadius: radii.sm,
  },

  // Placeholder styles (no media)
  placeholderContainer: {
    width: "100%",
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  quoteContainer: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
  },
  placeholderCaption: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xl,
    textAlign: "center",
    lineHeight: 32,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  watermarkPlaceholder: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },

  // Info section styles
  infoSection: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  username: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
  },
  date: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  caption: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    lineHeight: 22,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tribunBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  tribunText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },
  tagline: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
});

export default ShareableMomentCard;
