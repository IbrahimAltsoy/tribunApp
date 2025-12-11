import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
import { radii } from "../theme/spacing";

const IS_IOS = Platform.OS === "ios";

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

  // Animations
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const heroTitleAnim = useRef(new Animated.Value(0)).current;
  const [statCardsAnim] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const momentCardWidth = 240;

  // Animate hero and stats on mount
  useEffect(() => {
    Animated.sequence([
      // Animate hero first
      Animated.stagger(150, [
        Animated.spring(badgeAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(heroTitleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Then animate stat cards with stagger
      Animated.stagger(
        80,
        statCardsAnim.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, [badgeAnim, heroTitleAnim, statCardsAnim]);

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
          colors={[
            colors.primary,
            "rgba(0, 191, 71, 0.8)",
            "rgba(11, 17, 28, 0.9)",
            colors.background,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <BlurView
            intensity={IS_IOS ? 20 : 15}
            tint="dark"
            style={styles.heroBlur}
          >
            <Animated.View
              style={[
                styles.heroBadgeRow,
                {
                  opacity: badgeAnim,
                  transform: [
                    {
                      translateY: badgeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Badge icon="planet" text={t("archive.heroBadgeAmedArea")} />
              <Badge icon="pulse" text={t("archive.heroBadgeTribune")} tone="accent" />
            </Animated.View>
            <Animated.Text
              style={[
                styles.heroTitle,
                {
                  opacity: heroTitleAnim,
                  transform: [
                    {
                      translateY: heroTitleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {t("archive.heroTitle")}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.heroSubtitle,
                {
                  opacity: heroTitleAnim,
                  transform: [
                    {
                      translateY: heroTitleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {t("archive.heroSubtitle")}
            </Animated.Text>
            <View style={styles.statRow}>
              {quickStats.map((item, index) => {
                const cardAnim = statCardsAnim[index];
                const scaleAnim = useRef(new Animated.Value(1)).current;

                return (
                  <Animated.View
                    key={item.label}
                    style={[
                      {
                        opacity: cardAnim,
                        transform: [
                          {
                            translateY: cardAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                          { scale: scaleAnim },
                        ],
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.statCard}
                      disabled={!item.route}
                      onPress={() => item.route && navigation.navigate(item.route)}
                      onPressIn={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 0.96,
                          tension: 300,
                          friction: 20,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1,
                          tension: 300,
                          friction: 20,
                          useNativeDriver: true,
                        }).start();
                      }}
                    >
                      <BlurView
                        intensity={IS_IOS ? 10 : 8}
                        tint="dark"
                        style={styles.statCardBlur}
                      >
                        <View style={styles.statCardLeft}>
                          <Text style={styles.statValue}>{item.value}</Text>
                          <Text style={styles.statLabel}>{item.label}</Text>
                          <Text style={styles.statMeta}>{item.meta}</Text>
                        </View>
                        <View style={styles.statCardRight}>
                          <Ionicons
                            name="arrow-forward-circle"
                            size={32}
                            color={item.route ? colors.primary : colors.mutedText}
                            style={{ opacity: item.route ? 0.8 : 0.3 }}
                          />
                        </View>
                      </BlurView>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </BlurView>
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
            <LinearGradient
              key={moment.id}
              colors={[
                "rgba(0, 191, 71, 0.12)",
                "rgba(11, 17, 28, 0.85)",
                colors.card,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.momentCard}
            >
              <BlurView
                intensity={IS_IOS ? 8 : 6}
                tint="dark"
                style={styles.momentCardBlur}
              >
                <View style={styles.momentHeader}>
                  <Text style={styles.momentUser}>{moment.user}</Text>
                  <Chip icon="pin" label={moment.source} compact />
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                <Text style={styles.momentMeta}>{moment.location}</Text>
                <Text style={styles.momentMeta}>
                  {t("archive.timeAgo", { time: moment.time })}
                </Text>
              </BlurView>
            </LinearGradient>
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
              colors={[
                "rgba(0, 191, 71, 0.15)",
                "rgba(11, 17, 28, 0.92)",
                colors.card,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.announcementCard}
            >
              <BlurView
                intensity={IS_IOS ? 6 : 4}
                tint="dark"
                style={styles.announcementCardBlur}
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
              </BlurView>
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
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
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
              <LinearGradient
                key={moment.id}
                colors={[
                  "rgba(0, 191, 71, 0.1)",
                  "rgba(11, 17, 28, 0.8)",
                  colors.card,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCard}
              >
                <BlurView
                  intensity={IS_IOS ? 6 : 4}
                  tint="dark"
                  style={styles.modalCardBlur}
                >
                  <View style={styles.momentHeader}>
                    <Text style={styles.momentUser}>{moment.user}</Text>
                    <Chip icon="pin" label={moment.source} compact />
                  </View>
                  <Text style={styles.momentCaption}>{moment.caption}</Text>
                  <Text style={styles.momentMeta}>{moment.location}</Text>
                  <Text style={styles.momentMeta}>
                    {t("archive.timeAgo", { time: moment.time })}
                  </Text>
                </BlurView>
              </LinearGradient>
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
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
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
  <BlurView intensity={IS_IOS ? 20 : 15} tint="dark" style={styles.modalHeader}>
    <Pressable
      style={({ pressed }) => [
        styles.modalClose,
        pressed && { opacity: 0.6 },
      ]}
      onPress={onClose}
    >
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </Pressable>
    <Text style={styles.modalTitle}>{title}</Text>
  </BlurView>
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
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.sectionHeading,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
      >
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedText} />
      </Pressable>
    );
  }

  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
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
    borderRadius: 24,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  heroBlur: {
    padding: spacing.xl,
    backgroundColor: "rgba(11, 17, 28, 0.4)",
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
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statCardBlur: {
    padding: spacing.lg,
    backgroundColor: "rgba(11, 17, 28, 0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCardLeft: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  statCardRight: {
    marginLeft: spacing.md,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  momentCardBlur: {
    padding: spacing.md,
    backgroundColor: "rgba(11, 17, 28, 0.3)",
    gap: spacing.xs / 2,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 7,
      },
    }),
  },
  announcementCardBlur: {
    padding: spacing.md,
    backgroundColor: "rgba(11, 17, 28, 0.4)",
    gap: spacing.xs / 2,
    position: "relative",
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
    borderBottomColor: colors.borderLight,
    backgroundColor: "rgba(11, 17, 28, 0.5)",
    overflow: "hidden",
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalCardBlur: {
    padding: spacing.md,
    backgroundColor: "rgba(11, 17, 28, 0.35)",
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
