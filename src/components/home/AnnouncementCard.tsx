import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { openURLSafely } from "../../utils/urlValidator";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { Announcement } from "../../data/mockData";

type Props = {
  announcement: Announcement;
};

const AnnouncementCard: React.FC<Props> = ({ announcement }) => {
  const { t, i18n } = useTranslation();

  // Format the event date
  const formattedDate = announcement.date || new Date(announcement.eventDate).toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleLinkPress = () => {
    openURLSafely(announcement.link, {
      errorTitle: t("error"),
      invalidUrlMessage: t("validation.urlBlocked"),
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{announcement.title} </Text>
          <View style={styles.pill}>
            <Ionicons name="location-outline" size={14} color={colors.text} />
            <Text style={styles.pillText}>{announcement.city}</Text>
          </View>
        </View>
        <View style={styles.datePill}>
          <Ionicons name="calendar-outline" size={14} color={colors.text} />
          <Text style={styles.pillText}>{formattedDate}</Text>
        </View>
      </View>

      {announcement.location && (
        <View style={styles.metaRow}>
          <Ionicons name="navigate-outline" size={16} color={colors.mutedText} />
          <Text style={styles.metaText}>{announcement.location}</Text>
        </View>
      )}

      {announcement.note && <Text style={styles.note}>{announcement.note}</Text>}

      <View style={styles.footerRow}>
        {announcement.contact && (
          <View style={styles.contactRow}>
            <Ionicons name="chatbubbles-outline" size={16} color={colors.text} />
            <Text style={styles.contactText}>{announcement.contact}</Text>
          </View>
        )}
        {announcement.link && (
          <Pressable
            style={styles.cta}
            onPress={handleLinkPress}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{t("details")}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

// Wrap with React.memo for performance
export default React.memo(AnnouncementCard);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs / 2,
    backgroundColor: "rgba(15,169,88,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15,169,88,0.35)",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    backgroundColor: "rgba(209,14,14,0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(209,14,14,0.35)",
  },
  pillText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  metaText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  note: {
    color: colors.text,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  contactText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  ctaText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
});
