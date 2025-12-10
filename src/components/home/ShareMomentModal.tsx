import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { isValidImageURL } from "../../utils/urlValidator";
import { VALIDATION_LIMITS } from "../../constants/app";
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
}) => {
  const { t } = useTranslation();
  const [cityError, setCityError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);

  // Reset errors when modal closes
  useEffect(() => {
    if (!visible) {
      setCityError(null);
      setCaptionError(null);
      setImageUrlError(null);
    }
  }, [visible]);

  const validateCity = (text: string): boolean => {
    const trimmed = text.trim();

    if (!trimmed) {
      setCityError(t("shareMoment.cityRequired"));
      return false;
    }

    if (trimmed.length < VALIDATION_LIMITS.MOMENT_CITY_MIN) {
      setCityError(t("shareMoment.cityTooShort"));
      return false;
    }

    if (trimmed.length > VALIDATION_LIMITS.MOMENT_CITY_MAX) {
      setCityError(t("shareMoment.cityTooLong"));
      return false;
    }

    setCityError(null);
    return true;
  };

  const validateCaption = (text: string): boolean => {
    const trimmed = text.trim();

    if (!trimmed) {
      setCaptionError(t("shareMoment.captionRequired"));
      return false;
    }

    if (trimmed.length < VALIDATION_LIMITS.MOMENT_CAPTION_MIN) {
      setCaptionError(t("shareMoment.captionTooShort"));
      return false;
    }

    if (trimmed.length > VALIDATION_LIMITS.MOMENT_CAPTION_MAX) {
      setCaptionError(t("shareMoment.captionTooLong"));
      return false;
    }

    setCaptionError(null);
    return true;
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) {
      setImageUrlError(null);
      return true; // Optional field
    }

    if (!isValidImageURL(url)) {
      setImageUrlError(t("shareMoment.invalidImageUrl"));
      return false;
    }

    setImageUrlError(null);
    return true;
  };

  const handleCityChange = (text: string) => {
    if (text.length <= VALIDATION_LIMITS.MOMENT_CITY_MAX) {
      onChangeCity(text);
      if (cityError) {
        validateCity(text);
      }
    }
  };

  const handleCaptionChange = (text: string) => {
    if (text.length <= VALIDATION_LIMITS.MOMENT_CAPTION_MAX) {
      onChangeCaption(text);
      if (captionError) {
        validateCaption(text);
      }
    }
  };

  const handleImageUrlChange = (text: string) => {
    onChangeImageUrl(text);
    if (imageUrlError || text.trim()) {
      validateImageUrl(text);
    }
  };

  const handleSubmit = () => {
    const isCityValid = validateCity(newCity);
    const isCaptionValid = validateCaption(newCaption);
    const isImageValid = validateImageUrl(imageUrl);

    if (!isCityValid || !isCaptionValid || !isImageValid) {
      Alert.alert(
        t("error"),
        t("validation.required"),
        [{ text: t("ok") }]
      );
      return;
    }

    onSubmit();
  };

  return (
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
            <Text style={styles.modalTitle}>{t("shareMoment.title")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* City Input */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={t("shareMoment.cityPlaceholder")}
                placeholderTextColor={colors.mutedText}
                value={newCity}
                onChangeText={handleCityChange}
                onBlur={() => validateCity(newCity)}
                style={[
                  styles.modalInput,
                  cityError && styles.modalInputError,
                ]}
                maxLength={VALIDATION_LIMITS.MOMENT_CITY_MAX}
              />
              <Text style={styles.charCount}>
                {newCity.length}/{VALIDATION_LIMITS.MOMENT_CITY_MAX}
              </Text>
            </View>
            {cityError && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={14} color={colors.error} />
                <Text style={styles.errorText}>{cityError}</Text>
              </View>
            )}
          </View>

          {/* Caption Input */}
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={t("shareMoment.captionPlaceholder")}
                placeholderTextColor={colors.mutedText}
                value={newCaption}
                onChangeText={handleCaptionChange}
                onBlur={() => validateCaption(newCaption)}
                style={[
                  styles.modalInput,
                  { height: 80 },
                  captionError && styles.modalInputError,
                ]}
                multiline
                maxLength={VALIDATION_LIMITS.MOMENT_CAPTION_MAX}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {newCaption.length}/{VALIDATION_LIMITS.MOMENT_CAPTION_MAX}
              </Text>
            </View>
            {captionError && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={14} color={colors.error} />
                <Text style={styles.errorText}>{captionError}</Text>
              </View>
            )}
          </View>

          {/* Image URL Input */}
          <View>
            <TextInput
              placeholder={t("shareMoment.imageUrlPlaceholder")}
              placeholderTextColor={colors.mutedText}
              value={imageUrl}
              onChangeText={handleImageUrlChange}
              onBlur={() => validateImageUrl(imageUrl)}
              style={[
                styles.modalInput,
                imageUrlError && styles.modalInputError,
              ]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {imageUrlError && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={14} color={colors.error} />
                <Text style={styles.errorText}>{imageUrlError}</Text>
              </View>
            )}
          </View>

          {/* Image Preview */}
          {imageUrl && !imageUrlError ? (
            <View style={styles.previewBox}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
                onError={() => {
                  setImageUrlError(t("shareMoment.invalidImageUrl"));
                }}
              />
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.modalButton,
              (cityError || captionError || imageUrlError) && styles.modalButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!!(cityError || captionError || imageUrlError)}
          >
            <Text style={styles.modalButtonText}>{t("shareMoment.submit")}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  inputContainer: {
    position: "relative",
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    paddingRight: 50,
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
  },
  modalInputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  charCount: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    color: colors.mutedText,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    marginTop: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
  },
  previewBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  previewImage: {
    width: "100%",
    height: 160,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  modalButtonDisabled: {
    backgroundColor: colors.mutedText,
    opacity: 0.5,
  },
  modalButtonText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
});

export default ShareMomentModal;
