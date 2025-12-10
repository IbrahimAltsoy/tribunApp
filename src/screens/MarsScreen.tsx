import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  announcements as announcementData,
  fanMoments,
  kits,
  players,
} from "../data/mockData";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { useTranslation } from "react-i18next";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MarsStackParamList } from "../navigation/types";

const MarsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<MarsStackParamList>>();
  const [momentOpen, setMomentOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [announcementList, setAnnouncementList] = useState(announcementData);
  const [submission, setSubmission] = useState({
    title: "",
    city: "",
    location: "",
    date: "",
    contact: "",
    note: "",
  });

  const momentCardWidth = 240;

  const updateSubmission = (key: keyof typeof submission) => (value: string) => {
    setFormError(null);
    setSubmission((prev) => ({ ...prev, [key]: value }));
  };

  const quickStats: {
    label: string;
    value: string | number;
    meta: string;
    route?: keyof MarsStackParamList;
  }[] = [
    {
      label: t("archive.sectionArchive"),
      value: t("archive.since1932"),
      meta: t("archive.clubMemory"),
      route: "Archive",
    },
    {
      label: t("team.title"),
      value: players.length,
      meta: t("team.subtitle"),
      route: "Team",
    },
    {
      label: t("archive.sectionKits"),
      value: kits.length,
      meta: t("archive.formaPeriod"),
      route: "Kits",
    },
    {
      label: t("archive.sectionAnnouncements"),
      value: announcementList.length,
      meta: t("archive.activeCalls"),
    },
  ];

  const featureLinks: {
    title: string;
    subtitle: string;
    route: keyof MarsStackParamList;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      title: t("archive.sectionArchive"),
      subtitle: t("archive.sectionArchiveSubtitle"),
      route: "Archive",
      icon: "book-outline",
    },
    {
      title: t("archive.sectionLegends"),
      subtitle: t("archive.sectionLegendsSubtitle"),
      route: "Players",
      icon: "trophy-outline",
    },
    {
      title: t("archive.sectionKits"),
      subtitle: t("archive.sectionKitsSubtitle"),
      route: "Kits",
      icon: "shirt-outline",
    },
  ];

  const handleSubmitAnnouncement = () => {
    setFormSuccess(null);

    // Comprehensive validation
    const errors: string[] = [];

    // Title validation
    if (!submission.title?.trim()) {
      errors.push(t("announcement.titleRequired"));
    } else if (submission.title.trim().length < 5) {
      errors.push(t("announcement.titleTooShort"));
    } else if (submission.title.length > 200) {
      errors.push(t("announcement.titleTooLong"));
    }

    // City validation
    if (!submission.city?.trim()) {
      errors.push(t("announcement.cityRequired"));
    } else if (submission.city.length > 100) {
      errors.push(t("announcement.cityTooLong"));
    }

    // Date validation
    if (!submission.date?.trim()) {
      errors.push(t("announcement.dateRequired"));
    } else {
      const datePattern = /^\d{1,2}\s\w+,?\s\d{2}:\d{2}$/;
      if (!datePattern.test(submission.date)) {
        errors.push(t("announcement.invalidDateFormat"));
      }
    }

    // Optional field length validation
    if (submission.location && submission.location.length > 200) {
      errors.push(t("announcement.locationTooLong"));
    }
    if (submission.contact && submission.contact.length > 100) {
      errors.push(t("announcement.contactTooLong"));
    }
    if (submission.note && submission.note.length > 1000) {
      errors.push(t("announcement.noteTooLong"));
    }

    if (errors.length > 0) {
      setFormError(errors.join("\n"));
      Alert.alert(t("error"), errors.join("\n"), [{ text: t("ok") }]);
      return;
    }

    setFormError(null);
    setAnnouncementList((prev) => [
      {
        id: `local-${Date.now()}`,
        title: submission.title.trim(),
        city: submission.city.trim(),
        location: submission.location.trim(),
        date: submission.date.trim(),
        contact: submission.contact?.trim() || t("archive.contactUnknown"),
        note: submission.note.trim(),
        status: "pending" as const,
      },
      ...prev,
    ]);
    setSubmission({
      title: "",
      city: "",
      location: "",
      date: "",
      contact: "",
      note: "",
    });
    setFormSuccess(t("archive.formSuccess"));
    setSubmitOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={[colors.primary, "#0B111C", colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBadgeRow}>
            <Badge icon="planet" text={t("archive.heroBadgeAmedArea")} />
            <Badge icon="pulse" text={t("archive.heroBadgeTribune")} tone="accent" />
          </View>
          <Text style={styles.heroTitle}>{t("archive.heroTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("archive.heroSubtitle")}</Text>
        <View style={styles.statRow}>
          {quickStats.map((item) => (
            <Pressable
              key={item.label}
              style={styles.statCard}
              disabled={!item.route}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statMeta}>{item.meta}</Text>
              {item.route ? (
                <View style={styles.statAction}>
                  <Text style={styles.statActionText}>{t("archive.viewPage")}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.mutedText}
                  />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      </LinearGradient>

        <SectionHeading
          title={t("archive.sectionMoments")}
          subtitle={t("archive.sectionMomentsSubtitle")}
          icon="camera-outline"
          onPress={() => setMomentOpen(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={momentCardWidth + spacing.sm}
          snapToAlignment="start"
          contentContainerStyle={styles.momentRow}
        >
          {fanMoments.slice(0, 6).map((moment) => (
            <View key={moment.id} style={styles.momentCard}>
              <View style={styles.momentHeader}>
                <Text style={styles.momentUser}>{moment.user}</Text>
                <Chip icon="pin" label={moment.source} compact />
              </View>
              <Text style={styles.momentCaption}>{moment.caption}</Text>
              <Text style={styles.momentMeta}>{moment.location}</Text>
              <Text style={styles.momentMeta}>
                {t("archive.timeAgo", { time: moment.time })}
              </Text>
            </View>
          ))}
        </ScrollView>

        <SectionHeading
          title={t("archive.sectionAnnouncements")}
          subtitle={t("archive.sectionAnnouncementsSubtitle")}
          icon="megaphone-outline"
        />
        <View style={styles.announcementList}>
          {announcementList.map((item) => (
            <LinearGradient
              key={item.id}
              colors={["rgba(15,169,88,0.18)", "rgba(12,12,12,0.95)"]}
              style={styles.announcementCard}
            >
              <View style={styles.announcementAccent} />
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Chip icon="location" label={item.city} compact />
              </View>
              {item.status === "pending" ? (
                <Chip
                  icon="time-outline"
                  label={t("archive.pendingApproval")}
                  compact
                />
              ) : null}
              <View style={styles.announcementMetaRow}>
                <Meta icon="time-outline" text={item.date} />
                <Meta icon="navigate-outline" text={item.location} />
              </View>
              <Text style={styles.announcementNote}>{item.note}</Text>
              <Text style={styles.announcementContact}>
                {t("archive.contactLabel", {
                  contact: item.contact || t("archive.contactUnknown"),
                })}
              </Text>
            </LinearGradient>
          ))}
        </View>

        <SectionHeading
          title={t("archive.sectionCreate")}
          subtitle={t("archive.sectionCreateSubtitle")}
          icon="create-outline"
        />
        {formSuccess ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.successText}>{formSuccess}</Text>
          </View>
        ) : null}
        <View style={styles.handoffCard}>
          <View style={styles.handoffHeader}>
            <Ionicons name="shield-checkmark" size={18} color={colors.text} />
            <Text style={styles.handoffTitle}>{t("archive.moderatedAnnouncements")}</Text>
          </View>
          <Text style={styles.handoffBody}>
            {t("archive.moderationDescription")}
          </Text>
          <View style={styles.handoffActions}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                setFormError(null);
                setSubmitOpen(true);
              }}
            >
              <Text style={styles.secondaryText}>{t("archive.announcementForm")}</Text>
              <Ionicons name="create-outline" size={14} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={momentOpen}
        animationType="slide"
        onRequestClose={() => setMomentOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <ModalHeader
            title={t("archive.modalMomentsTitle")}
            onClose={() => setMomentOpen(false)}
          />
          <ScrollView contentContainerStyle={styles.modalContent}>
            {fanMoments.map((moment) => (
              <View key={moment.id} style={styles.modalCard}>
                <View style={styles.momentHeader}>
                  <Text style={styles.momentUser}>{moment.user}</Text>
                  <Chip icon="pin" label={moment.source} compact />
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                <Text style={styles.momentMeta}>{moment.location}</Text>
                <Text style={styles.momentMeta}>
                  {t("archive.timeAgo", { time: moment.time })}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={submitOpen}
        animationType="slide"
        onRequestClose={() => setSubmitOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <ModalHeader
            title={t("archive.modalSubmitTitle")}
            onClose={() => {
              setFormError(null);
              setSubmitOpen(false);
            }}
          />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.formHint}>{t("archive.formHint")}</Text>
            {formError ? (
              <View style={styles.formAlert}>
                <Ionicons name="alert-circle" size={16} color={colors.accent} />
                <Text style={styles.formAlertText}>{formError}</Text>
              </View>
            ) : null}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.title")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("archive.form.placeholderTitle")}
                placeholderTextColor={colors.mutedText}
                value={submission.title}
                onChangeText={updateSubmission("title")}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.city")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("archive.form.placeholderCity")}
                placeholderTextColor={colors.mutedText}
                value={submission.city}
                onChangeText={updateSubmission("city")}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.location")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("archive.form.placeholderLocation")}
                placeholderTextColor={colors.mutedText}
                value={submission.location}
                onChangeText={updateSubmission("location")}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.date")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("archive.form.placeholderDate")}
                placeholderTextColor={colors.mutedText}
                value={submission.date}
                onChangeText={updateSubmission("date")}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.contact")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("archive.form.placeholderContact")}
                placeholderTextColor={colors.mutedText}
                value={submission.contact}
                onChangeText={updateSubmission("contact")}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t("archive.form.note")}</Text>
              <TextInput
                style={[styles.formInput, { height: 90 }]}
                placeholder={t("archive.form.placeholderNote")}
                placeholderTextColor={colors.mutedText}
                value={submission.note}
                onChangeText={updateSubmission("note")}
                multiline
              />
            </View>
            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmitAnnouncement}
            >
              <Text style={styles.submitText}>{t("archive.submit")}</Text>
              <Ionicons name="shield-checkmark" size={16} color={colors.text} />
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const ModalHeader = ({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) => (
  <View style={styles.modalHeader}>
    <Pressable style={styles.modalClose} onPress={onClose}>
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </Pressable>
    <Text style={styles.modalTitle}>{title}</Text>
  </View>
);

const SectionHeading = ({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) => {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={styles.sectionHeading} onPress={onPress}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedText} />
      ) : null}
    </Wrapper>
  );
};

const Badge = ({
  icon,
  text,
  tone = "primary",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone?: "primary" | "accent";
}) => (
  <View
    style={[
      styles.badge,
      tone === "accent" ? styles.badgeAccent : styles.badgePrimary,
    ]}
  >
    <Ionicons
      name={icon}
      size={14}
      color={tone === "accent" ? colors.accent : colors.text}
    />
    <Text
      style={[styles.badgeText, tone === "accent" && { color: colors.accent }]}
    >
      {text}
    </Text>
  </View>
);

const Chip = ({
  icon,
  label,
  compact,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string | number;
  compact?: boolean;
}) => (
  <View
    style={[
      styles.chip,
      compact && {
        paddingVertical: spacing.xs / 2,
        paddingHorizontal: spacing.sm,
      },
    ]}
  >
    <Ionicons name={icon} size={14} color={colors.text} />
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const Meta = ({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) => (
  <View style={styles.metaRow}>
    <Ionicons name={icon} size={14} color={colors.mutedText} />
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    padding: spacing.xl,
    borderRadius: 24,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: colors.text,
    fontFamily: typography.medium,
    lineHeight: 22,
    opacity: 0.88,
  },
  heroBadgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    backgroundColor: colors.glassStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  statAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    marginTop: spacing.xs,
  },
  statActionText: {
    color: colors.dimmedText,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  statValue: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
  },
  statLabel: {
    color: colors.mutedText,
    fontFamily: typography.semiBold,
    marginTop: spacing.xs / 2,
  },
  statMeta: {
    color: colors.dimmedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionIcon: {
    padding: spacing.xs,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
  },
  sectionSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  momentRow: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  momentCard: {
    width: 240,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs / 2,
    ...shadows.sm,
  },
  momentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },
  momentUser: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  momentCaption: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  momentMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  announcementList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  announcementCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs / 2,
    overflow: "hidden",
    position: "relative",
    ...shadows.sm,
  },
  announcementAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: colors.primary,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  announcementTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },
  announcementMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.xs / 2,
  },
  announcementNote: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  announcementContact: {
    color: colors.text,
    fontFamily: typography.semiBold,
    marginTop: spacing.xs,
  },
  handoffCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.sm,
  },
  handoffHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  handoffTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  handoffBody: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  handoffActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  successText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    flex: 1,
  },
  formGroup: {
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  formLabel: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: typography.medium,
    backgroundColor: colors.card,
  },
  submitBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  submitText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  formHint: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginBottom: spacing.sm,
  },
  formAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: "rgba(209,14,14,0.08)",
    borderWidth: 1,
    borderColor: "rgba(209,14,14,0.3)",
  },
  formAlertText: {
    color: colors.text,
    fontFamily: typography.medium,
    flex: 1,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  secondaryText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  primaryGhostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  primaryGhostText: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingVertical: spacing.xs / 1.5,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgePrimary: {},
  badgeAccent: {
    backgroundColor: "rgba(209,14,14,0.1)",
    borderColor: "rgba(209,14,14,0.4)",
  },
  badgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  metaText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalClose: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  modalHero: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeroTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs,
  },
  modalHeroBody: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  modalSection: {
    gap: spacing.sm,
  },
  modalSectionTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  modalCard: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.xs / 2,
  },
  modalCardTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  modalCardBody: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
});

export default MarsScreen;
