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
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  announcements as announcementData,
  kits,
  players,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { useTranslation } from "react-i18next";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MarsStackParamList } from "../navigation/types";

const IS_IOS = Platform.OS === "ios";

const MarsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<MarsStackParamList>>();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [announcementList, setAnnouncementList] = useState(announcementData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [submission, setSubmission] = useState({
    title: "",
    city: "",
    location: "",
    date: "",
    contact: "",
    note: "",
  });

  // Announcement card animations
  const [announcementCardsAnim] = useState(() =>
    announcementList.map(() => new Animated.Value(0))
  );

  // Scale animations for interactive cards
  const [statScaleAnims] = useState(() =>
    Array(4).fill(0).map(() => new Animated.Value(1))
  );
  const [announcementScaleAnims] = useState(() =>
    announcementList.map(() => new Animated.Value(1))
  );

  // Animations

  const badgeAnim = useRef(new Animated.Value(0)).current;
  const heroTitleAnim = useRef(new Animated.Value(0)).current;
  const [statCardsAnim] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

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

    // Animate announcement cards
    setTimeout(() => {
      Animated.stagger(
        60,
        announcementCardsAnim.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        )
      ).start();
    }, 500);
  }, [badgeAnim, heroTitleAnim, statCardsAnim, announcementCardsAnim]);

  const updateSubmission = (key: keyof typeof submission) => (value: string) => {
    setFormError(null);
    setSubmission((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // Format: "12 Aralık, 14:30"
      const day = date.getDate();
      const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      const month = monthNames[date.getMonth()];
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const formattedDate = `${day} ${month}, ${hours}:${minutes}`;

      setSubmission((prev) => ({ ...prev, date: formattedDate }));
    }
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
    setSelectedDate(new Date());
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
                const scaleAnim = statScaleAnims[index];

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
          title={t("archive.sectionAnnouncements")}
          subtitle={t("archive.sectionAnnouncementsSubtitle")}
          icon="megaphone-outline"
        />
        <View style={styles.announcementList}>
          {announcementList.map((item, index) => {
            const cardAnim = announcementCardsAnim[index] || new Animated.Value(1);
            const scaleAnim = announcementScaleAnims[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={item.id}
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
                  onPressIn={() => {
                    Animated.spring(scaleAnim, {
                      toValue: 0.97,
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
                  <LinearGradient
                    colors={[
                      "rgba(0, 191, 71, 0.18)",
                      "rgba(0, 191, 71, 0.08)",
                      "rgba(11, 17, 28, 0.95)",
                      colors.card,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.announcementCard}
                  >
                    <BlurView
                      intensity={IS_IOS ? 8 : 6}
                      tint="dark"
                      style={styles.announcementCardBlur}
                    >
                      <View style={styles.announcementAccent} />
                      <View style={styles.announcementTopRow}>
                        <View style={styles.announcementIconWrapper}>
                          <Ionicons
                            name="megaphone"
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        {item.status === "pending" ? (
                          <View style={styles.pendingBadge}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={colors.accent}
                            />
                            <Text style={styles.pendingBadgeText}>
                              {t("archive.pendingApproval")}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.announcementHeader}>
                        <Text style={styles.announcementTitle}>{item.title}</Text>
                      </View>
                      <View style={styles.announcementMetaRow}>
                        <View style={styles.metaChip}>
                          <Ionicons
                            name="location"
                            size={14}
                            color={colors.primary}
                          />
                          <Text style={styles.metaChipText}>{item.city}</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={colors.mutedText}
                          />
                          <Text style={styles.metaChipText}>{item.date}</Text>
                        </View>
                      </View>
                      {item.location ? (
                        <View style={styles.locationRow}>
                          <Ionicons
                            name="navigate-outline"
                            size={14}
                            color={colors.mutedText}
                          />
                          <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                      ) : null}
                      {item.note ? (
                        <Text style={styles.announcementNote}>{item.note}</Text>
                      ) : null}
                      <View style={styles.announcementFooter}>
                        <Ionicons
                          name="person-circle-outline"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.announcementContact}>
                          {item.contact || t("archive.contactUnknown")}
                        </Text>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <SectionHeading
          title={t("archive.sectionCreate")}
          subtitle={t("archive.sectionCreateSubtitle")}
          icon="create-outline"
        />
        {formSuccess ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.successText}>{formSuccess}</Text>
          </View>
        ) : null}
        <LinearGradient
          colors={[
            "rgba(0, 191, 71, 0.12)",
            "rgba(11, 17, 28, 0.85)",
            colors.card,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.handoffCard}
        >
          <BlurView
            intensity={IS_IOS ? 8 : 6}
            tint="dark"
            style={styles.handoffCardBlur}
          >
            <View style={styles.handoffIconRow}>
              <View style={styles.handoffIconWrapper}>
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.handoffTitle}>
                  {t("archive.moderatedAnnouncements")}
                </Text>
                <Text style={styles.handoffSubtitle}>
                  {t("archive.moderationDescription")}
                </Text>
              </View>
            </View>
            <View style={styles.handoffActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.createAnnouncementBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setFormError(null);
                  setSubmitOpen(true);
                }}
              >
                <LinearGradient
                  colors={[colors.primary, "rgba(0, 191, 71, 0.8)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createAnnouncementBtnGradient}
                >
                  <Ionicons name="add-circle" size={18} color={colors.text} />
                  <Text style={styles.createAnnouncementBtnText}>
                    {t("archive.announcementForm")}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.text}
                  />
                </LinearGradient>
              </Pressable>
            </View>
          </BlurView>
        </LinearGradient>
      </ScrollView>

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
              <Pressable
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {submission.date || t("archive.form.placeholderDate")}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  locale="tr-TR"
                />
              )}
              {Platform.OS === "ios" && showDatePicker && (
                <Pressable
                  style={styles.datePickerDone}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Tamam</Text>
                </Pressable>
              )}
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
  announcementList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  announcementCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 9,
      },
    }),
  },
  announcementCardBlur: {
    padding: spacing.lg,
    backgroundColor: "rgba(11, 17, 28, 0.3)",
    gap: spacing.sm,
    position: "relative",
  },
  announcementAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  announcementTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  announcementIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 191, 71, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 191, 71, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
    backgroundColor: "rgba(209, 14, 14, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(209, 14, 14, 0.3)",
  },
  pendingBadgeText: {
    color: colors.accent,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  announcementHeader: {
    marginBottom: spacing.xs,
  },
  announcementTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    lineHeight: 24,
  },
  announcementMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: 8,
    backgroundColor: "rgba(11, 17, 28, 0.6)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  locationText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    flex: 1,
  },
  announcementNote: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  announcementFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  announcementContact: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    flex: 1,
  },
  handoffCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  handoffCardBlur: {
    padding: spacing.lg,
    backgroundColor: "rgba(11, 17, 28, 0.4)",
    gap: spacing.md,
  },
  handoffIconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  handoffIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(0, 191, 71, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 191, 71, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  handoffTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs / 2,
    lineHeight: 24,
  },
  handoffSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    lineHeight: 20,
    opacity: 0.85,
  },
  handoffActions: {
    marginTop: spacing.xs,
  },
  createAnnouncementBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  createAnnouncementBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  createAnnouncementBtnText: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    flex: 1,
    textAlign: "center",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: "rgba(0, 191, 71, 0.15)",
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successText: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalCardBlur: {
    padding: spacing.lg,
    backgroundColor: "rgba(11, 17, 28, 0.35)",
    gap: spacing.sm,
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  datePickerText: {
    color: colors.text,
    fontFamily: typography.medium,
    flex: 1,
  },
  datePickerDone: {
    marginTop: spacing.sm,
    alignSelf: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  datePickerDoneText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
});

export default MarsScreen;
