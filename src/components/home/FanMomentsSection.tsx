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
  onPressMore: () => void;
  onSelectMoment: (moment: FanMomentDto) => void;
  onEditMoment?: (moment: FanMomentDto) => void;
  onDeleteMoment?: (moment: FanMomentDto) => void;
  slot?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const AnimatedMomentCard: React.FC<{
  moment: FanMomentDto;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  activeAudioMomentId: string | null;
  activeMomentId: string | null;
  setActiveAudioMomentId: (id: string | null) => void;
}> = React.memo(
  ({
    moment,
    onPress,
    onEdit,
    onDelete,
    activeAudioMomentId,
    activeMomentId,
    setActiveAudioMomentId,
  }) => {
  const { t } = useTranslation();
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
  }, [moment.videoUrl]);

  const player = useVideoPlayer(videoUri ? { uri: videoUri } : null, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    if (!player || !videoUri) {
      return;
    }

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
      toValue: 0.95,
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.momentCard, { transform: [{ scale: scaleAnim }] }]}
      >
        {moment.imageUrl ? (
          <ImageBackground
            source={{ uri: moment.imageUrl }}
            style={styles.momentImage}
            imageStyle={styles.momentImageStyle}
          >
            {/* Owner Actions - Top Right Corner */}
            {moment.isOwnMoment && (onEdit || onDelete) && (
              <View style={styles.ownerActions}>
                {onEdit && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons name="pencil" size={16} color={colors.primary} />
                    </BlurView>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.error}
                      />
                    </BlurView>
                  </Pressable>
                )}
              </View>
            )}
          </ImageBackground>
        ) : moment.videoUrl ? (
          <View style={[styles.momentImage, styles.momentFallback]}>
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
              onPress={(e) => {
                e.stopPropagation();
                if (activeMomentId !== moment.id) {
                  return;
                }
                if (activeAudioMomentId === moment.id) {
                  setActiveAudioMomentId(null);
                } else {
                  setActiveAudioMomentId(moment.id);
                }
              }}
              style={({ pressed }) => [
                styles.soundToggle,
                pressed && styles.soundTogglePressed,
              ]}
            >
              <Ionicons
                name={activeAudioMomentId === moment.id ? "volume-high" : "volume-mute"}
                size={16}
                color={colors.white}
              />
            </Pressable>
            {/* Owner Actions - Top Right Corner (for non-image moments) */}
            {moment.isOwnMoment && (onEdit || onDelete) && (
              <View style={styles.ownerActions}>
                {onEdit && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons name="pencil" size={16} color={colors.primary} />
                    </BlurView>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.error}
                      />
                    </BlurView>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.momentImage, styles.momentFallback]}>
            {/* Owner Actions - Top Right Corner (for non-image moments) */}
            {moment.isOwnMoment && (onEdit || onDelete) && (
              <View style={styles.ownerActions}>
                {onEdit && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons name="pencil" size={16} color={colors.primary} />
                    </BlurView>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <BlurView
                      intensity={IS_IOS ? 25 : 18}
                      tint="dark"
                      style={styles.actionButtonBlur}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.error}
                      />
                    </BlurView>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.momentBody}>
          <View style={styles.momentMetaRow}>
            <View style={styles.momentUserRow}>
              <View style={styles.momentAvatar}>
                <Ionicons name="person" size={14} color={colors.text} />
              </View>
              <Text style={styles.momentLocation} numberOfLines={1}>
                {moment.username}
              </Text>
            </View>
            <Text style={styles.momentTime}>
              {new Date(moment.createdAt).toLocaleDateString("tr-TR")}
            </Text>
          </View>
          {!!moment.description && (
            <Text style={styles.momentCaption} numberOfLines={3}>
              {moment.description}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
  }
);

const FanMomentsSection: React.FC<Props> = React.memo(({
  moments,
  onPressAdd,
  onPressMore,
  onSelectMoment,
  onEditMoment,
  onDeleteMoment,
  slot,
  refreshing = false,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const visibleMoments = (moments || []).slice(0, 10);

  const addCardScale = useRef(new Animated.Value(1)).current;
  const moreCardScale = useRef(new Animated.Value(1)).current;
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

  // Pulse animation for add button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleAddPressIn = () => {
    Animated.spring(addCardScale, {
      toValue: 0.95,
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
    <FlatList
      data={visibleMoments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.momentsColumn}
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
            tintColor="#FFFFFF"
            colors={["#0FA958", "#12C26A"]}
          />
        ) : undefined
      }
      ListHeaderComponent={
        <>
          {/* Loading indicator for pull-to-refresh */}
          {refreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.refreshText}>Yenileniyor...</Text>
            </View>
          )}
          <Pressable
            onPress={onPressAdd}
            onPressIn={handleAddPressIn}
            onPressOut={handleAddPressOut}
          >
            <Animated.View
              style={[
                styles.momentComposer,
                { transform: [{ scale: addCardScale }] },
              ]}
            >
              <View style={styles.composerLeft}>
                <View style={styles.composerAvatar}>
                  <Ionicons name="person" size={18} color={colors.text} />
                </View>
                <View style={styles.composerTextBlock}>
                  <Text style={styles.composerTitle}>
                    {t("home.shareMomentTitle")}
                  </Text>
                  <Text style={styles.composerSub}>
                    {t("home.shareMomentSubtitle")}
                  </Text>
                </View>
              </View>
              <Animated.View
                style={[
                  styles.composerAction,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons name="camera" size={18} color={colors.primary} />
              </Animated.View>
            </Animated.View>
          </Pressable>
          {slot && visibleMoments.length < 3 && (
            <View style={styles.slotContainer}>{slot}</View>
          )}
          <View style={styles.listSeparator} />
        </>
      }
      ListFooterComponent={
        moments.length > 10 ? (
          <Pressable
            onPress={onPressMore}
            onPressIn={handleMorePressIn}
            onPressOut={handleMorePressOut}
          >
            <Animated.View
              style={[
                styles.momentMoreCard,
                { transform: [{ scale: moreCardScale }] },
              ]}
            >
              <BlurView
                intensity={IS_IOS ? 25 : 20}
                tint="dark"
                style={styles.momentMoreBlur}
              >
                <View style={styles.momentMoreIconWrapper}>
                  <Ionicons
                    name="albums-outline"
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.momentMoreTitle}>
                  {t("home.moreMomentsTitle")}
                </Text>
                <Text style={styles.momentMoreCount}>
                  +{moments.length - 10} {t("home.more")}
                </Text>
              </BlurView>
            </Animated.View>
          </Pressable>
        ) : null
      }
      renderItem={({ item, index }) => (
        <>
          <AnimatedMomentCard
            moment={item}
            onPress={() => onSelectMoment(item)}
            onEdit={onEditMoment ? () => onEditMoment(item) : undefined}
            onDelete={onDeleteMoment ? () => onDeleteMoment(item) : undefined}
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
  momentsColumn: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  listSeparator: {
    height: spacing.md,
  },
  slotContainer: {
    gap: spacing.md,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  refreshText: {
    color: colors.primary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },

  // Moment Card Styles
  momentCard: {
    width: "100%",
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  momentImage: {
    height: 320,
  },
  momentImageStyle: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  momentBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  momentMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  momentUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  momentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  momentLocation: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    flex: 1,
  },
  momentTime: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  momentCaption: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  momentFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    transform: [{ scale: 0.96 }],
  },

  // Owner Action Buttons
  ownerActions: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
    zIndex: 10,
  },
  actionButton: {
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  actionButtonBlur: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 10, 10, 0.7)",
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },

  // Add Card Styles
  momentComposer: {
    width: "100%",
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowSoft,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  composerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  composerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  composerAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(0, 191, 71, 0.1)",
  },

  // More Card Styles
  momentMoreCard: {
    width: "100%",
    height: 140,
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
  momentMoreBlur: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    backgroundColor: "rgba(19, 30, 19, 0.6)",
  },
  momentMoreIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 191, 71, 0.1)",
    marginBottom: spacing.xs,
  },
  momentMoreTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    textAlign: "center",
  },
  momentMoreCount: {
    color: colors.primary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
});

export default FanMomentsSection;
