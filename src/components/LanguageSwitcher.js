import React from "react";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import i18n, { availableLanguages } from "../i18n";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const LanguageSwitcher = ({ onClose }) => {
  const { t } = useTranslation();
  const current = i18n.language;
  const isRTL = I18nManager.isRTL;

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {t("change_language")}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          {t("current_language")} <Text style={styles.code}>{current}</Text>
        </Text>
      </View>

      <View style={styles.greetingCard}>
        <Text style={[styles.greeting, isRTL && styles.rtlText]}>
          {t("greeting")}
        </Text>
      </View>

      <View style={styles.grid}>
        {availableLanguages.map((lng) => {
          const active = lng.code === current;
          return (
            <Pressable
              key={lng.code}
              onPress={() => handleChange(lng.code)}
              style={[
                styles.langButton,
                active && styles.langButtonActive,
                isRTL && styles.langButtonRTL,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.langLabel,
                  active && styles.langLabelActive,
                  isRTL && styles.rtlText,
                ]}
              >
                {lng.label}
              </Text>
              <Text
                style={[
                  styles.langCode,
                  active && styles.langLabelActive,
                  isRTL && styles.rtlText,
                ]}
              >
                {lng.code.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {onClose ? (
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
        >
          <Text style={styles.closeText}>Kapat</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  code: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  greetingCard: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greeting: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  langButton: {
    width: "47%",
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs / 2,
  },
  langButtonActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(15,169,88,0.08)",
  },
  langButtonRTL: {
    flexDirection: "row-reverse",
  },
  langLabel: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  langLabelActive: {
    color: colors.primary,
  },
  langCode: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  closeButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  closeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  rtlText: {
    textAlign: "right",
  },
});

export default LanguageSwitcher;
