import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  type = "danger",
  onConfirm,
  onCancel,
}) => {
  const confirmGradient: readonly [string, string] =
    type === "danger"
      ? ["#EF4444", "#DC2626"]
      : ["#F59E0B", "#D97706"];

  const iconName = type === "danger" ? "trash-outline" : "warning-outline";
  const iconColor = type === "danger" ? colors.error : colors.warning;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={[styles.iconWrap, { borderColor: iconColor + "33" }]}>
            <Ionicons name={iconName as any} size={28} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onConfirm}
            >
              <LinearGradient
                colors={confirmGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  container: {
    width: "85%",
    backgroundColor: colors.backgroundElevated,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderHeavy,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSubtle,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: colors.borderHeavy,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmGradient: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cancelText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.white,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});

export default ConfirmModal;
