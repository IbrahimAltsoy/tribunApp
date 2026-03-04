import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { BlurView } from "expo-blur";
import { mediaService } from "../../services/mediaService";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import type { FanMomentDto } from "../../types/fanMoment";

type Props = {
  visible: boolean;
  moment?: FanMomentDto;
  onClose: () => void;
  onReport?: () => void;
};

const MomentDetailModal: React.FC<Props> = ({ visible, moment, onClose, onReport }) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadVideo = async () => {
      if (!moment?.videoUrl) {
        setVideoUri(null);
        return;
      }

      if (/^https?:\/\//i.test(moment.videoUrl)) {
        if (isActive) setVideoUri(moment.videoUrl);
        return;
      }

      const result = await mediaService.getSignedUrl(moment.videoUrl);
      if (isActive) {
        setVideoUri(result.success ? result.url ?? null : null);
      }
    };

    loadVideo();
    return () => { isActive = false; };
  }, [moment?.videoUrl]);

  useEffect(() => {
    setIsMuted(true);
  }, [moment?.id]);

  const player = useVideoPlayer(videoUri ? { uri: videoUri } : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (player) player.muted = isMuted;
  }, [isMuted, player]);

  const hasMedia = !!(moment?.imageUrl || moment?.videoUrl);
  const dateStr = moment?.createdAt
    ? new Date(moment.createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Tap backdrop to close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header row: close | title | report */}
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>

            <Text style={styles.headerTitle}>Paylaşılan An</Text>

            {onReport ? (
              <Pressable
                onPress={onReport}
                style={({ pressed }) => [styles.headerBtn, styles.reportBtn, pressed && styles.headerBtnPressed]}
              >
                <Ionicons name="flag-outline" size={17} color={colors.textTertiary} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero media */}
            {moment?.imageUrl ? (
              <ImageBackground
                source={{ uri: moment.imageUrl }}
                style={styles.heroImage}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0)"]}
                  style={styles.heroTopGradient}
                />
              </ImageBackground>
            ) : moment?.videoUrl ? (
              <View style={styles.heroImage}>
                {videoUri && player ? (
                  <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    surfaceType="textureView"
                    useExoShutter={false}
                  />
                ) : null}
                <Pressable
                  onPress={() => setIsMuted((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.soundToggle,
                    pressed && styles.soundTogglePressed,
                  ]}
                >
                  <Ionicons
                    name={isMuted ? "volume-mute" : "volume-high"}
                    size={16}
                    color={colors.white}
                  />
                </Pressable>
              </View>
            ) : null}

            {/* Content section */}
            <View style={styles.content}>
              {/* Author + date row */}
              <View style={styles.authorRow}>
                <View style={styles.authorLeft}>
                  <View style={[styles.avatar, moment?.creatorUserId && styles.avatarLinked]}>
                    <Ionicons name="person" size={13} color={colors.text} />
                  </View>
                  <Text style={styles.username} numberOfLines={1}>
                    {moment?.username}
                  </Text>
                </View>
                <Text style={styles.date}>{dateStr}</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Full caption — no line limit */}
              {!!moment?.description ? (
                <Text style={styles.caption}>{moment.description}</Text>
              ) : (
                <Text style={styles.captionEmpty}>Açıklama eklenmemiş.</Text>
              )}

              {/* Like count */}
              {(moment?.likeCount ?? 0) > 0 && (
                <View style={styles.likeRow}>
                  <Ionicons name="heart" size={14} color={colors.error} />
                  <Text style={styles.likeCount}>
                    {moment?.likeCount}{" "}
                    <Text style={styles.likeLabel}>beğeni</Text>
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  // ─── Bottom Sheet ────────────────────────────────────────────────────────
  sheet: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glassStroke,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: { elevation: 20 },
    }),
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderHeavy,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  headerTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },

  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.93 }],
  },

  reportBtn: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.2)",
  },

  scrollContent: {
    flexGrow: 1,
  },

  // ─── Hero image / video ───────────────────────────────────────────────────
  heroImage: {
    width: "100%",
    height: 280,
    backgroundColor: colors.card,
  },

  heroTopGradient: {
    height: 60,
  },

  soundToggle: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  soundTogglePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  // ─── Content ─────────────────────────────────────────────────────────────
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  authorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLinked: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  username: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },

  date: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs / 2,
  },

  caption: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },

  captionEmpty: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
  },

  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  likeCount: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },

  likeLabel: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
  },
});

export default MomentDetailModal;
