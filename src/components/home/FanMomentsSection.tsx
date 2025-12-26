import React, { useRef, useEffect } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { colors } from "../../theme/colors";
import { spacing, radii } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { useTranslation } from "react-i18next";
import type { FanMomentDto } from "../../types/fanMoment";

const IS_IOS = Platform.OS === "ios";

type Props = {
  moments: FanMomentDto[];
  onPressAdd: () => void;
  onPressMore: () => void;
  onSelectMoment: (moment: FanMomentDto) => void;
  onEditMoment?: (moment: FanMomentDto) => void;
  onDeleteMoment?: (moment: FanMomentDto) => void;
};

const AnimatedMomentCard: React.FC<{
  moment: FanMomentDto;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ moment, onPress, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Debug: Log what we receive
  console.log(`🎴 [MOMENT CARD] Rendering moment ${moment.id.substring(0, 8)}:`, {
    description: moment.description?.substring(0, 20),
    isOwnMoment: moment.isOwnMoment,
    hasOnEdit: !!onEdit,
    hasOnDelete: !!onDelete,
    willShowButtons: !!(moment.isOwnMoment && (onEdit || onDelete)),
  });

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
            {/* Dark gradient overlay for text readability */}
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
              style={StyleSheet.absoluteFillObject}
            />

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
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </BlurView>
                  </Pressable>
                )}
              </View>
            )}

            {/* Glassmorphism Content Container */}
            <View style={styles.momentContent}>
              {/* Caption with better hierarchy */}
              <Text style={styles.momentCaption} numberOfLines={2}>
                {moment.description || ''}
              </Text>

              {/* Username & Time Row */}
              <View style={styles.momentFooter}>
                <View style={styles.momentLocationRow}>
                  <Ionicons
                    name="person"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={styles.momentLocation} numberOfLines={1}>
                    {moment.username}
                  </Text>
                </View>
                <Text style={styles.momentTime}>
                  {new Date(moment.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          </ImageBackground>
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
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </BlurView>
                  </Pressable>
                )}
              </View>
            )}

            <Text style={styles.momentCaption}>{moment.description || ''}</Text>
            <Text style={styles.momentLocation}>{moment.username}</Text>
            <Text style={styles.momentTime}>
              {new Date(moment.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const FanMomentsSection: React.FC<Props> = ({
  moments,
  onPressAdd,
  onPressMore,
  onSelectMoment,
  onEditMoment,
  onDeleteMoment,
}) => {
  const { t } = useTranslation();
  const visibleMoments = (moments || []).slice(0, 5);

  const addCardScale = useRef(new Animated.Value(1)).current;
  const moreCardScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.momentsRow}
      decelerationRate="fast"
      snapToInterval={236}
    >
      {/* Add Moment Card - Premium Design */}
      <Pressable
        onPress={onPressAdd}
        onPressIn={handleAddPressIn}
        onPressOut={handleAddPressOut}
      >
        <Animated.View
          style={[
            styles.momentAddCard,
            { transform: [{ scale: addCardScale }] },
          ]}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={[
              "rgba(0, 191, 71, 0.15)",
              "rgba(0, 191, 71, 0.08)",
              "rgba(0, 191, 71, 0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Content */}
          <View style={styles.momentAddContent}>
            {/* Animated Icon with Glow */}
            <Animated.View
              style={[
                styles.momentAddIconWrapper,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.momentAddIconGlow} />
              <BlurView
                intensity={IS_IOS ? 20 : 15}
                tint="dark"
                style={styles.momentAddIcon}
              >
                <Ionicons name="camera" size={26} color={colors.primary} />
              </BlurView>
            </Animated.View>

            <Text style={styles.momentAddTitle}>
              {t("home.shareMomentTitle")}
            </Text>
            <Text style={styles.momentAddSub}>
              {t("home.shareMomentSubtitle")}
            </Text>

            {/* CTA Arrow */}
            <View style={styles.momentAddArrow}>
              <Ionicons
                name="arrow-forward-circle"
                size={24}
                color={colors.primary}
              />
            </View>
          </View>
        </Animated.View>
      </Pressable>

      {/* Fan Moments */}
      {visibleMoments.map((moment) => (
        <AnimatedMomentCard
          key={moment.id}
          moment={moment}
          onPress={() => onSelectMoment(moment)}
          onEdit={onEditMoment ? () => onEditMoment(moment) : undefined}
          onDelete={onDeleteMoment ? () => onDeleteMoment(moment) : undefined}
        />
      ))}

      {/* More Moments Card */}
      {moments.length > 5 && (
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
                +{moments.length - 5} {t("home.more")}
              </Text>
            </BlurView>
          </Animated.View>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  momentsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },

  // Moment Card Styles
  momentCard: {
    width: 220,
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
    height: 240,
  },
  momentImageStyle: {
    borderRadius: radii.xl,
  },
  momentContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  momentSourcePill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  momentSourcePillTribun: {
    borderColor: colors.accent,
  },
  momentSourceText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  momentCaption: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  momentFooter: {
    gap: spacing.xs,
  },
  momentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  momentLocation: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    flex: 1,
  },
  momentTime: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  momentFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
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
  momentAddCard: {
    width: 200,
    height: 240,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  momentAddContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  momentAddIconWrapper: {
    position: "relative",
    marginBottom: spacing.xs,
  },
  momentAddIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 191, 71, 0.1)",
    overflow: "hidden",
  },
  momentAddIconGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    opacity: 0.2,
    top: 0,
    left: 0,
  },
  momentAddTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  momentAddSub: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    textAlign: "center",
    lineHeight: 18,
  },
  momentAddArrow: {
    marginTop: spacing.xs,
  },

  // More Card Styles
  momentMoreCard: {
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
