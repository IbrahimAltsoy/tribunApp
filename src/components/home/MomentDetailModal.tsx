import React from "react";
import {
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  visible: boolean;
  moment?: FanMoment;
  onClose: () => void;
};

const MomentDetailModal: React.FC<Props> = ({ visible, moment, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.detailOverlay}>
      <View style={styles.detailCard}>
        <TouchableOpacity style={styles.detailClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        {moment?.image ? (
          <ImageBackground
            source={moment.image}
            style={styles.detailImage}
            imageStyle={{ borderRadius: 16 }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.25)"]}
              style={StyleSheet.absoluteFillObject}
            />
          </ImageBackground>
        ) : (
          <View style={[styles.detailImage, styles.momentFallback]}>
            <Text style={styles.momentCaption}>{moment?.caption}</Text>
          </View>
        )}
        <View style={styles.detailContent}>
          <View
            style={[
              styles.momentSourcePill,
              moment?.source === "Tribun" && {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Text style={styles.momentSourceText}>{moment?.source}</Text>
          </View>
          <Text style={styles.detailCaption}>{moment?.caption}</Text>
          <Text style={styles.detailMeta}>
            {moment?.location} ¶ú {moment?.time} Çônce
          </Text>
          <Text style={styles.detailMeta}>PaylaYan: {moment?.user}</Text>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
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
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 2,
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
});

export default MomentDetailModal;
