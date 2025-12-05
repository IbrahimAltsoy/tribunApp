import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { fanMoments } from "../../data/mockData";

type FanMoment = (typeof fanMoments)[0];

type Props = {
  moments: FanMoment[];
  onPressAdd: () => void;
  onPressMore: () => void;
  onSelectMoment: (moment: FanMoment) => void;
};

const FanMomentsSection: React.FC<Props> = ({
  moments,
  onPressAdd,
  onPressMore,
  onSelectMoment,
}) => {
  const visibleMoments = moments.slice(0, 5);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.momentsRow}
    >
      <Pressable style={styles.momentAddCard} onPress={onPressAdd}>
        <View style={styles.momentAddIcon}>
          <Ionicons name="add" size={20} color={colors.text} />
        </View>
        <Text style={styles.momentAddTitle}>Anı Paylaş</Text>
        <Text style={styles.momentAddSub}>Şehir, kısa not ve görsel ekle</Text>
      </Pressable>

      {visibleMoments.map((moment) => (
        <Pressable
          key={moment.id}
          style={styles.momentCard}
          onPress={() => onSelectMoment(moment)}
        >
          {moment.image ? (
            <ImageBackground
              source={moment.image}
              style={styles.momentImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.momentContent}>
                <View style={styles.momentSourcePill}>
                  <Text style={styles.momentSourceText}>{moment.source}</Text>
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                <Text style={styles.momentLocation}>{moment.location}</Text>
                <Text style={styles.momentTime}>{moment.time} önce</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.momentImage, styles.momentFallback]}>
              <Text style={styles.momentCaption}>{moment.caption}</Text>
              <Text style={styles.momentLocation}>{moment.location}</Text>
              <Text style={styles.momentTime}>{moment.time} önce</Text>
            </View>
          )}
        </Pressable>
      ))}

      {moments.length > 5 && (
        <Pressable style={styles.momentMoreCard} onPress={onPressMore}>
          <Ionicons
            name="albums-outline"
            size={22}
            color={colors.accentLight}
          />
          <Text style={styles.momentMoreTitle}>Daha fazlası</Text>
          <Text style={styles.momentMoreSub}>Tüm tribün anlarını gör</Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  momentsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  momentCard: {
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  momentAddCard: {
    width: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(15,169,88,0.08)",
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center",
  },
  momentAddIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  momentAddTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentAddSub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentMoreCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center",
  },
  momentMoreTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentMoreSub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentImage: {
    height: 200,
  },
  momentContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    gap: spacing.xs,
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
  momentLocation: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentTime: {
    color: colors.mutedText,
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
});

export default FanMomentsSection;
