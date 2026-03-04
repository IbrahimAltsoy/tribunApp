import React, { useRef, useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { useTranslation } from "react-i18next";
import { mediaService } from "../../services/mediaService";
import type { FanMomentDto } from "../../types/fanMoment";

const IS_IOS = Platform.OS === "ios";

type Props = {
  moments: FanMomentDto[];
  onPressAdd: () => void;
  onSelectMoment: (moment: FanMomentDto) => void;
  onEditMoment?: (moment: FanMomentDto) => void;
  onDeleteMoment?: (moment: FanMomentDto) => void;
  onShareMoment?: (moment: FanMomentDto) => void;
  onLikeMoment?: (moment: FanMomentDto) => void;
  onPressAuthor?: (userId: string, username: string) => void;
  slot?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
};

const AnimatedMomentCard: React.FC<{
  moment: FanMomentDto;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  onPressAuthor?: (userId: string, username: string) => void;
  activeAudioMomentId: string | null;
  activeMomentId: string | null;
  setActiveAudioMomentId: (id: string | null) => void;
}> = React.memo(
  ({
    moment,
    onPress,
    onEdit,
    onDelete,
    onShare,
    onLike,
    onPressAuthor,
    activeAudioMomentId,
    activeMomentId,
    setActiveAudioMomentId,
  }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const lastPlaybackTime = useRef(0);
  const wasActive = useRef(false);

  useEffect(() => {
    let isActive = true;

    const loadVideo = async () => {
      if (!moment.videoUrl) {
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
  }, [moment.videoUrl]);

  const player = useVideoPlayer(videoUri ? { uri: videoUri } : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (!player || !videoUri) return;

    const isActive = activeMomentId === moment.id;
    if (isActive) {
      if (!wasActive.current && lastPlaybackTime.current > 0) {
        player.currentTime = lastPlaybackTime.current;
      }
      player.muted = activeAudioMomentId !== moment.id;
      player.play();
    } else {
      if (wasActive.current) {
        lastPlaybackTime.current = player.currentTime || 0;
      }
      player.muted = true;
      player.pause();
    }

    wasActive.current = isActive;
  }, [activeMomentId, activeAudioMomentId, moment.id, player, videoUri]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  // Owner action buttons (top-right corner)
  const ownerActionsNode =
    moment.isOwnMoment && (onEdit || onDelete || onShare) ? (
      <View style={styles.ownerActions}>
        {onShare && (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onShare(); }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <BlurView intensity={IS_IOS ? 28 : 20} tint="dark" style={styles.actionButtonBlur}>
              <Ionicons name="share-outline" size={14} color={colors.white} />
            </BlurView>
          </Pressable>
        )}
        {onEdit && (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onEdit(); }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <BlurView intensity={IS_IOS ? 28 : 20} tint="dark" style={styles.actionButtonBlur}>
              <Ionicons name="pencil" size={14} color={colors.accent} />
            </BlurView>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onDelete(); }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <BlurView intensity={IS_IOS ? 28 : 20} tint="dark" style={styles.actionButtonBlur}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </BlurView>
          </Pressable>
        )}
      </View>
    ) : null;

  // Gradient overlay with author, caption, likes — sits above image at bottom
  const mediaOverlay = (
    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.88)"]}
      style={styles.momentOverlay}
    >
      {!!moment.description && (
        <Text style={styles.overlayCaption} numberOfLines={1}>
          {moment.description}
        </Text>
      )}
      <View style={styles.overlayFooter}>
        {/* Author */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (onPressAuthor && moment.creatorUserId) {
              onPressAuthor(moment.creatorUserId, moment.username);
            }
          }}
          style={({ pressed }) => [styles.overlayAuthorRow, pressed && styles.authorPressed]}
          disabled={!moment.creatorUserId}
        >
          <View style={[styles.overlayAvatar, moment.creatorUserId && styles.overlayAvatarLinked]}>
            <Ionicons name="person" size={10} color={colors.white} />
          </View>
          <Text style={styles.overlayUsername} numberOfLines={1}>
            {moment.username}
          </Text>
          {moment.creatorUserId && (
            <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.4)" />
          )}
        </Pressable>

        {/* Date + like */}
        <View style={styles.overlayRight}>
          <Text style={styles.overlayDate}>
            {new Date(moment.createdAt).toLocaleDateString("tr-TR")}
          </Text>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onLike?.(); }}
            style={({ pressed }) => [styles.overlayLikeBtn, pressed && styles.likeButtonPressed]}
            hitSlop={8}
          >
            <Ionicons
              name={moment.hasLiked ? "heart" : "heart-outline"}
              size={17}
              color={moment.hasLiked ? colors.error : "rgba(255,255,255,0.9)"}
            />
            <Text style={[styles.overlayLikeCount, moment.hasLiked && styles.overlayLikeCountActive]}>
              {moment.likeCount}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.momentCard, { transform: [{ scale: scaleAnim }] }]}>
        {moment.imageUrl ? (
          /* — Image card: full-bleed with gradient overlay — */
          <ImageBackground
            source={{ uri: moment.imageUrl }}
            style={styles.momentHero}
          >
            {ownerActionsNode}
            {mediaOverlay}
          </ImageBackground>

        ) : moment.videoUrl ? (
          /* — Video card: VideoView with gradient overlay — */
          <View style={styles.momentHero}>
            {videoUri && player ? (
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                surfaceType="textureView"
                useExoShutter={false}
              />
            ) : null}
            {/* Sound toggle — top left to avoid owner actions */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (activeMomentId !== moment.id) return;
                if (activeAudioMomentId === moment.id) {
                  setActiveAudioMomentId(null);
                } else {
                  setActiveAudioMomentId(moment.id);
                }
              }}
              style={({ pressed }) => [styles.soundToggle, pressed && styles.soundTogglePressed]}
            >
              <Ionicons
                name={activeAudioMomentId === moment.id ? "volume-high" : "volume-mute"}
                size={14}
                color={colors.white}
              />
            </Pressable>
            {ownerActionsNode}
            {mediaOverlay}
          </View>

        ) : (
          /* — Text-only card: clean dark card — */
          <View style={styles.momentFallback}>
            {ownerActionsNode}
            {!!moment.description && (
              <Text style={styles.fallbackCaption} numberOfLines={5}>
                {moment.description}
              </Text>
            )}
            <View style={styles.fallbackFooter}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (onPressAuthor && moment.creatorUserId) {
                    onPressAuthor(moment.creatorUserId, moment.username);
                  }
                }}
                style={({ pressed }) => [styles.fallbackAuthorRow, pressed && styles.authorPressed]}
                disabled={!moment.creatorUserId}
              >
                <View style={[styles.fallbackAvatar, moment.creatorUserId && styles.fallbackAvatarLinked]}>
                  <Ionicons name="person" size={12} color={colors.text} />
                </View>
                <Text style={styles.fallbackUsername} numberOfLines={1}>
                  {moment.username}
                </Text>
                {moment.creatorUserId && (
                  <Ionicons name="chevron-forward" size={11} color={colors.textTertiary} />
                )}
              </Pressable>
              <View style={styles.fallbackRight}>
                <Text style={styles.fallbackDate}>
                  {new Date(moment.createdAt).toLocaleDateString("tr-TR")}
                </Text>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); onLike?.(); }}
                  style={({ pressed }) => [styles.fallbackLikeBtn, pressed && styles.likeButtonPressed]}
                  hitSlop={8}
                >
                  <Ionicons
                    name={moment.hasLiked ? "heart" : "heart-outline"}
                    size={17}
                    color={moment.hasLiked ? colors.error : colors.textSecondary}
                  />
                  <Text style={[styles.fallbackLikeCount, moment.hasLiked && styles.likeCountActive]}>
                    {moment.likeCount}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
  }
);

const FanMomentsSection: React.FC<Props> = React.memo(({
  moments,
  onPressAdd,
  onSelectMoment,
  onEditMoment,
  onDeleteMoment,
  onShareMoment,
  onLikeMoment,
  onPressAuthor,
  slot,
  refreshing = false,
  onRefresh,
  onLoadMore,
  loadingMore = false,
  hasMore = true,
}) => {
  const { t } = useTranslation();

  const addCardScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [activeAudioMomentId, setActiveAudioMomentId] = useState<string | null>(null);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: FanMomentDto }> }) => {
      const firstVisible = viewableItems[0]?.item;
      setActiveMomentId(firstVisible?.id ?? null);
    }
  ).current;

  useEffect(() => {
    if (activeAudioMomentId && activeAudioMomentId !== activeMomentId) {
      setActiveAudioMomentId(null);
    }
  }, [activeAudioMomentId, activeMomentId]);

  // Gentle pulse on camera button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleAddPressIn = () => {
    Animated.spring(addCardScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleAddPressOut = () => {
    Animated.spring(addCardScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <FlatList
      data={moments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary, colors.primaryLight]}
          />
        ) : undefined
      }
      ListHeaderComponent={
        <>
          {/* Composer bar */}
          <Pressable
            onPress={onPressAdd}
            onPressIn={handleAddPressIn}
            onPressOut={handleAddPressOut}
          >
            <Animated.View
              style={[styles.momentComposer, { transform: [{ scale: addCardScale }] }]}
            >
              <View style={styles.composerLeft}>
                <View style={styles.composerAvatar}>
                  <Ionicons name="person" size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.composerTextBlock}>
                  <Text style={styles.composerTitle}>{t("home.shareMomentTitle")}</Text>
                  <Text style={styles.composerSub}>{t("home.shareMomentSubtitle")}</Text>
                </View>
              </View>
              <Animated.View style={[styles.composerAction, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="camera" size={18} color={colors.white} />
              </Animated.View>
            </Animated.View>
          </Pressable>

          {slot && moments.length < 3 && (
            <View style={styles.slotContainer}>{slot}</View>
          )}

          {/* Section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>TRİBÜN ANLARI</Text>
            <View style={styles.sectionLine} />
          </View>
        </>
      }
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <>
          <AnimatedMomentCard
            moment={item}
            onPress={() => onSelectMoment(item)}
            onEdit={onEditMoment ? () => onEditMoment(item) : undefined}
            onDelete={onDeleteMoment ? () => onDeleteMoment(item) : undefined}
            onShare={onShareMoment ? () => onShareMoment(item) : undefined}
            onLike={onLikeMoment ? () => onLikeMoment(item) : undefined}
            onPressAuthor={onPressAuthor}
            activeAudioMomentId={activeAudioMomentId}
            activeMomentId={activeMomentId}
            setActiveAudioMomentId={setActiveAudioMomentId}
          />
          {slot && index === 2 && (
            <View style={styles.slotContainer}>{slot}</View>
          )}
        </>
      )}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  listSeparator: {
    height: spacing.sm,
  },
  slotContainer: {
    gap: spacing.md,
  },

  // ─── Moment Card ────────────────────────────────────────────────────────────
  momentCard: {
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.07)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },

  // Full-bleed image / video container
  momentHero: {
    height: 300,
    justifyContent: "flex-end",
    backgroundColor: colors.backgroundElevated,
  },

  // Gradient overlay sitting at the bottom of hero
  momentOverlay: {
    paddingTop: 56,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },

  overlayCaption: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  overlayFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  overlayAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },

  authorPressed: {
    opacity: 0.6,
  },

  overlayAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  overlayAvatarLinked: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  overlayUsername: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  overlayRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  overlayDate: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  overlayLikeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  overlayLikeCount: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },

  overlayLikeCountActive: {
    color: colors.error,
  },

  // ─── Text-only fallback card ──────────────────────────────────────────────
  momentFallback: {
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    minHeight: 140,
    gap: spacing.sm,
  },

  fallbackCaption: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    lineHeight: 22,
    flex: 1,
  },

  fallbackFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  fallbackAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },

  fallbackAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackAvatarLinked: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  fallbackUsername: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    flex: 1,
  },

  fallbackRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  fallbackDate: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  fallbackLikeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  fallbackLikeCount: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },

  likeCountActive: {
    color: colors.error,
    fontFamily: typography.semiBold,
  },

  // ─── Sound Toggle (video, top-left) ─────────────────────────────────────
  soundToggle: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    zIndex: 10,
  },

  soundTogglePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  // ─── Owner Action Buttons (top-right) ───────────────────────────────────
  ownerActions: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
    zIndex: 10,
  },

  actionButton: {
    borderRadius: radii.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },

  actionButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.93 }],
  },

  actionButtonBlur: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 8, 8, 0.75)",
  },


  likeButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.93 }],
  },

  // ─── Composer bar ────────────────────────────────────────────────────────
  momentComposer: {
    width: "100%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(232,17,26,0.18)",
    borderLeftWidth: 3,
    borderLeftColor: "#E8111A",
    backgroundColor: colors.backgroundElevated,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#E8111A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },

  composerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },

  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderHeavy,
  },

  composerTextBlock: {
    flex: 1,
    gap: 2,
  },

  composerTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },

  composerSub: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },

  // Red filled camera button — primary action
  composerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.45,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },

  // ─── Section Header ──────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: "#E8111A",
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#E8111A",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
    }),
  },

  sectionTitle: {
    color: colors.textTertiary,
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 2,
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  // ─── Loading More ────────────────────────────────────────────────────────
  loadingMoreContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FanMomentsSection;
