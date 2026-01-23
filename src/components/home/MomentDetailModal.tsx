import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { mediaService } from "../../services/mediaService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import type { FanMomentDto } from "../../types/fanMoment";
import ReportBlockModal from "../ReportBlockModal";

type Props = {
  visible: boolean;
  moment?: FanMomentDto;
  onClose: () => void;
  sessionId?: string;
};

const MomentDetailModal: React.FC<Props> = ({ visible, moment, onClose, sessionId }) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadVideo = async () => {
      if (!moment?.videoUrl) {
        setVideoUri(null);
        return;
      }

      if (/^https?:\/\//i.test(moment.videoUrl)) {
        if (isActive) {
          setVideoUri(moment.videoUrl);
        }
        return;
      }

      const result = await mediaService.getSignedUrl(moment.videoUrl);
      if (isActive) {
        setVideoUri(result.success ? result.url ?? null : null);
      }
    };

    loadVideo();

    return () => {
      isActive = false;
    };
  }, [moment?.videoUrl]);

  useEffect(() => {
    setIsMuted(true);
  }, [moment?.id]);

  const player = useVideoPlayer(videoUri ? { uri: videoUri } : null, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.detailOverlay}>
        <View style={styles.detailCard}>
          <View style={styles.headerButtons}>
            {sessionId && !moment?.isOwnMoment && (
              <TouchableOpacity
                style={styles.detailReport}
                onPress={() => setShowReportModal(true)}
              >
                <Ionicons name="flag-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.detailClose} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          {moment?.imageUrl ? (
            <ImageBackground
              source={{ uri: moment.imageUrl }}
              style={styles.detailImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.25)"]}
                style={StyleSheet.absoluteFillObject}
              />
            </ImageBackground>
          ) : moment?.videoUrl ? (
            <View style={[styles.detailImage, styles.momentFallback]}>
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
                  styles.detailSoundToggle,
                  pressed && styles.detailSoundTogglePressed,
                ]}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={16}
                  color={colors.white}
                />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.detailImage, styles.momentFallback]}>
              <Text style={styles.momentCaption}>{moment?.description || ""}</Text>
            </View>
          )}
          <View style={styles.detailContent}>
            <Text style={styles.detailCaption}>{moment?.description || ""}</Text>
            <Text style={styles.detailMeta}>
              {new Date(moment?.createdAt || "").toLocaleDateString("tr-TR")}
            </Text>
            <Text style={styles.detailMeta}>PaylaYan: {moment?.username}</Text>
          </View>
        </View>
      </View>

      {/* Report Modal */}
      {sessionId && moment && (
        <ReportBlockModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          sessionId={sessionId}
          targetSessionId={moment.creatorSessionId || ''}
          contentType="FanMoment"
          contentId={moment.id}
          showBlockOption={!!moment.creatorSessionId}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  headerButtons: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 2,
    flexDirection: "row",
    gap: spacing.xs,
  },
  detailReport: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 14,
    padding: spacing.xs,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  detailCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailClose: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 14,
    padding: spacing.xs,
  },
  detailImage: {
    height: 260,
  },
  detailContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  detailCaption: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  detailMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  momentSourcePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15,169,88,0.8)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  momentSourceText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  momentCaption: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  detailSoundToggle: {
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
  detailSoundTogglePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});

export default MomentDetailModal;
