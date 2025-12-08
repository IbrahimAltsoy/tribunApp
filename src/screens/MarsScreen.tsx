import React, { useState } from "react";
import {
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
  archiveHighlights,
  kits,
  legends,
  fanMoments,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { useTranslation } from "react-i18next";

const MarsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [announcementList, setAnnouncementList] = useState(announcementData);
  const [form, setForm] = useState({
    title: "",
    city: "",
    location: "",
    date: "",
    contact: "",
    note: "",
  });

  const handleCreateAnnouncement = () => {
    if (!form.title || !form.city || !form.date) return;
    const newItem = {
      id: Date.now().toString(),
      ...form,
    };
    setAnnouncementList((prev) => [newItem, ...prev]);
    setForm({
      title: "",
      city: "",
      location: "",
      date: "",
      contact: "",
      note: "",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={["#132017", "#0D0D0D"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>{t("archive.heroTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("archive.heroSubtitle")}</Text>
        </LinearGradient>

        <SectionHeading title={t("archive.sectionArchive")} icon="book-outline" />
        <View style={styles.grid}>
          {archiveHighlights.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.detail}</Text>
            </View>
          ))}
        </View>

        <SectionHeading title={t("archive.sectionLegends")} icon="trophy-outline" />
        <View style={styles.legendList}>
          {legends.map((legend) => (
            <View key={legend.id} style={styles.legendCard}>
              <View style={styles.legendHeader}>
                <Text style={styles.legendName}>{legend.name}</Text>
                <Text style={styles.legendYears}>{legend.years}</Text>
              </View>
              <Text style={styles.legendRole}>{legend.role}</Text>
              <Text style={styles.legendHighlight}>{legend.highlight}</Text>
            </View>
          ))}
        </View>

        <SectionHeading title={t("archive.sectionKits")} icon="shirt-outline" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kitRow}
        >
          {kits.map((kit) => (
            <LinearGradient
              key={kit.id}
              colors={["rgba(15,169,88,0.15)", "rgba(209,14,14,0.08)"]}
              style={styles.kitCard}
            >
              <Text style={styles.kitSeason}>{kit.season}</Text>
              <Text style={styles.kitTitle}>{kit.title}</Text>
              <Text style={styles.kitPalette}>{kit.palette}</Text>
              <Text style={styles.kitNote}>{kit.note}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <SectionHeading title={t("archive.sectionMoments")} icon="camera-outline" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.momentRow}
        >
          {fanMoments.slice(0, 4).map((moment) => (
            <View key={moment.id} style={styles.momentCard}>
              <Text style={styles.momentUser}>{moment.user}</Text>
              <Text style={styles.momentCaption}>{moment.caption}</Text>
              <Text style={styles.momentMeta}>{moment.location}</Text>
              <Text style={styles.momentMeta}>
                {t("archive.timeAgo", { time: moment.time })}
              </Text>
            </View>
          ))}
        </ScrollView>

        <SectionHeading title={t("archive.sectionAnnouncements")} icon="megaphone-outline" />
        <View style={styles.announcementList}>
          {announcementList.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementCity}>{item.city}</Text>
              </View>
              <Text style={styles.announcementMeta}>{item.date}</Text>
              <Text style={styles.announcementMeta}>{item.location}</Text>
              <Text style={styles.announcementNote}>{item.note}</Text>
              <Text style={styles.announcementContact}>
                {t("archive.contactLabel", {
                  contact: item.contact || t("archive.contactUnknown"),
                })}
              </Text>
            </View>
          ))}
        </View>

        <SectionHeading title={t("archive.sectionCreate")} icon="create-outline" />
        <View style={styles.form}>
          <FormInput
            label={t("archive.form.title")}
            value={form.title}
            onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
          />
          <FormInput
            label={t("archive.form.city")}
            value={form.city}
            onChangeText={(text) => setForm((prev) => ({ ...prev, city: text }))}
          />
          <FormInput
            label={t("archive.form.location")}
            value={form.location}
            onChangeText={(text) => setForm((prev) => ({ ...prev, location: text }))}
          />
          <FormInput
            label={t("archive.form.date")}
            value={form.date}
            onChangeText={(text) => setForm((prev) => ({ ...prev, date: text }))}
          />
          <FormInput
            label={t("archive.form.contact")}
            value={form.contact}
            onChangeText={(text) => setForm((prev) => ({ ...prev, contact: text }))}
          />
          <FormInput
            label={t("archive.form.note")}
            value={form.note}
            onChangeText={(text) => setForm((prev) => ({ ...prev, note: text }))}
            multiline
          />

          <Pressable style={styles.submitBtn} onPress={handleCreateAnnouncement}>
            <Text style={styles.submitText}>{t("archive.submit")}</Text>
          </Pressable>
          <Text style={styles.formHint}>
            {t("archive.formHint")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeading = ({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.sectionHeading}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FormInput = ({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={[styles.formInput, multiline && { height: 80 }]}
      placeholder={label}
      placeholderTextColor={colors.mutedText}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />
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
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 22,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    width: "48%",
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    marginBottom: spacing.xs,
  },
  cardText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  legendList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  legendCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  legendName: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  legendYears: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  legendRole: {
    color: colors.primary,
    fontFamily: typography.semiBold,
    marginBottom: spacing.xs,
  },
  legendHighlight: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
  },
  kitRow: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  kitCard: {
    width: 220,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kitSeason: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  kitTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs,
  },
  kitPalette: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  kitNote: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
  momentRow: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  momentCard: {
    width: 220,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs / 2,
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
    borderColor: colors.border,
    gap: spacing.xs / 2,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  announcementTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },
  announcementCity: {
    color: colors.accent,
    fontFamily: typography.semiBold,
  },
  announcementMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  announcementNote: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  announcementContact: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  form: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  formLabel: {
    color: colors.text,
    fontFamily: typography.medium,
    marginBottom: spacing.xs / 2,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: typography.medium,
    backgroundColor: colors.card,
  },
  submitBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  formHint: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.sm,
  },
});

export default MarsScreen;
