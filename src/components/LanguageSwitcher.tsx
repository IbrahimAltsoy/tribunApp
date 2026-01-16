import React from "react";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n, { availableLanguages } from "../i18n";
import type { LanguageCode } from "../i18n";
import { languageService, SupportedLanguage } from "../utils/languageService";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

type LanguageSwitcherProps = {
  onClose?: () => void;
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const current =
    (availableLanguages.find((lng) => lng.code === i18n.language)?.code as
      LanguageCode | undefined) || availableLanguages[0].code;
  const isRTL = I18nManager.isRTL;

  const handleChange = async (code: LanguageCode) => {
    // Use languageService to change and persist language
    await languageService.setLanguage(code as SupportedLanguage);
    onClose?.();
  };

  const languageFlags: Record<LanguageCode, string> = {
    tr: "🇹🇷",
    en: "🇺🇸",
    ku: "🟥🟢🟡",
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.premiumHeader}>
        <LinearGradient
          colors={["rgba(15, 169, 88, 0.15)", "rgba(15, 169, 88, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="globe" size={24} color={colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
              {t("change_language")}
            </Text>
            <Text style={[styles.headerSubtitle, isRTL && styles.rtlText]}>
              {t("current_language")}{" "}
              <Text style={styles.currentLangBadge}>
                {languageFlags[current]} {current.toUpperCase()}
              </Text>
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Language Grid */}
      <View style={styles.grid}>
        {availableLanguages.map((lng) => {
          const active = lng.code === current;
          return (
            <Pressable
              key={lng.code}
              onPress={() => handleChange(lng.code)}
              style={({ pressed }) => [
                styles.langCard,
                active && styles.langCardActive,
                pressed && styles.langCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              {active && (
                <LinearGradient
                  colors={["rgba(15, 169, 88, 0.2)", "rgba(15, 169, 88, 0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.langCardContent}>
                <Text style={styles.flagEmoji}>{languageFlags[lng.code]}</Text>
                <View style={styles.langTextContainer}>
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
                      active && styles.langCodeActive,
                      isRTL && styles.rtlText,
                    ]}
                  >
                    {lng.code.toUpperCase()}
                  </Text>
                </View>
                {active && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Close Button */}
      {onClose && (
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[colors.primary, "#0FA958"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.closeGradient}
          >
            <Text style={styles.closeText}>{t("actions.close")}</Text>
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  // Premium Header Styles
  premiumHeader: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassStroke,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerGradient: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(15, 169, 88, 0.15)",
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  headerTitle: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  currentLangBadge: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },
  // Language Grid Styles
  grid: {
    gap: spacing.md,
  },
  langCard: {
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  langCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  langCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  langCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  flagEmoji: {
    fontSize: 32,
    lineHeight: 36,
  },
  langTextContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  langLabel: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    letterSpacing: 0.2,
  },
  langLabelActive: {
    color: colors.primary,
  },
  langCode: {
    color: colors.textSecondary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  langCodeActive: {
    color: colors.primary,
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  // Close Button Styles
  closeButton: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  closeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  closeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  closeText: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.5,
  },
  rtlText: {
    textAlign: "right",
  },
});

export default LanguageSwitcher;
