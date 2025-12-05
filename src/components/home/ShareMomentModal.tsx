import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";

type Props = {
  visible: boolean;
  newCity: string;
  newCaption: string;
  imageUrl: string;
  onChangeCity: (text: string) => void;
  onChangeCaption: (text: string) => void;
  onChangeImageUrl: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const ShareMomentModal: React.FC<Props> = ({
  visible,
  newCity,
  newCaption,
  imageUrl,
  onChangeCity,
  onChangeCaption,
  onChangeImageUrl,
  onSubmit,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalCard}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>TribÇ¬n AnŽñ PaylaY</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="?ehir / Lokasyon"
          placeholderTextColor={colors.mutedText}
          value={newCity}
          onChangeText={onChangeCity}
          style={styles.modalInput}
        />
        <TextInput
          placeholder="KŽñsa aÇõŽñklama"
          placeholderTextColor={colors.mutedText}
          value={newCaption}
          onChangeText={onChangeCaption}
          style={[styles.modalInput, { height: 80 }]}
          multiline
        />
        <TextInput
          placeholder="GÇôrsel URL (opsiyonel)"
          placeholderTextColor={colors.mutedText}
          value={imageUrl}
          onChangeText={onChangeImageUrl}
          style={styles.modalInput}
          autoCapitalize="none"
        />
        {imageUrl ? (
          <View style={styles.previewBox}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <TouchableOpacity style={styles.modalButton} onPress={onSubmit}>
          <Text style={styles.modalButtonText}>Ekle</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.sm,
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
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.medium,
  },
  previewBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: 160,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  modalButtonText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
});

export default ShareMomentModal;
