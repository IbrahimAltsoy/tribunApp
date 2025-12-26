import React from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import type { FanMomentDto } from "../../types/fanMoment";

type Props = {
  visible: boolean;
  moments: FanMomentDto[];
  onClose: () => void;
  onSelect: (moment: FanMomentDto) => void;
};

const AllMomentsModal: React.FC<Props> = ({
  visible,
  moments,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.allOverlay}>
      <View style={styles.allCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("home.allTribuneMoments")}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.allList}
          showsVerticalScrollIndicator={false}
        >
          {moments.map((moment) => (
            <Pressable
              key={moment.id}
              style={styles.allItem}
              onPress={() => onSelect(moment)}
            >
              {moment.imageUrl ? (
                <ImageBackground
                  source={{ uri: moment.imageUrl }}
                  style={styles.allImage}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                </ImageBackground>
              ) : (
                <View style={[styles.allImage, styles.momentFallback]} />
              )}
              <View style={styles.allText}>
                <Text style={styles.allCaption}>{moment.description || ''}</Text>
                <Text style={styles.allMeta}>
                  {moment.username} • {new Date(moment.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  allOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing.lg,
  },
  allCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  allList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  allItem: {
    flexDirection: "row",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  allImage: {
    width: 110,
    height: 90,
  },
  allText: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    gap: spacing.xs,
    justifyContent: "center",
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
  allCaption: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  allMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default AllMomentsModal;
