import React, { useMemo, useState } from "react";
import {
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [kitOpen, setKitOpen] = useState(false);
  const [momentOpen, setMomentOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [announcementList, setAnnouncementList] = useState(announcementData);
  const [submission, setSubmission] = useState({
    title: "",
    city: "",
    location: "",
    date: "",
    contact: "",
    note: "",
  });

  const quickStats = [
    { label: t("archive.sectionArchive"), value: "1932→", meta: "Kulüp hafızası" },
    { label: t("archive.sectionLegends"), value: legends.length, meta: "İkon" },
    { label: t("archive.sectionKits"), value: kits.length, meta: "Forma dönemi" },
    { label: t("archive.sectionAnnouncements"), value: announcementList.length, meta: "Aktif çağrı" },
  ];

  const handleSubmitAnnouncement = () => {
    if (!submission.title || !submission.city || !submission.date) return;
    setAnnouncementList((prev) => [
      {
        id: `local-${Date.now()}`,
        ...submission,
        contact: submission.contact || t("archive.contactUnknown"),
        status: "pending",
      } as any,
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
    setSubmitOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={["#0FA958", "#0B111C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBadgeRow}>
            <Badge icon="planet" text="Mars Station" />
            <Badge icon="pulse" text="Tribün Hafızası" tone="accent" />
          </View>
          <Text style={styles.heroTitle}>{t("archive.heroTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("archive.heroSubtitle")}</Text>
          <View style={styles.heroPills}>
            <Chip icon="flame" label="Tribün ruhu" />
            <Chip icon="map" label="Şehir buluşmaları" />
            <Chip icon="time" label="Arşiv hatları" />
          </View>
          <View style={styles.statRow}>
            {quickStats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statMeta}>{item.meta}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <SectionHeading
          title={t("archive.sectionArchive")}
          subtitle="Büyük hikayeyi üç satırda yakala"
          icon="book-outline"
          onPress={() => setArchiveOpen(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineRow}
        >
          {archiveHighlights.map((item, index) => (
            <LinearGradient
              key={item.id}
              colors={["rgba(15,169,88,0.18)", "rgba(13,13,13,0.9)"]}
              style={[styles.timelineCard, index === 0 && styles.timelineCardFirst]}
            >
              <View style={styles.timelineDot} />
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineBody}>{item.detail}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <SectionHeading
          title={t("archive.sectionLegends")}
          subtitle="İkonlar, roller, altın anlar"
          icon="trophy-outline"
          onPress={() => setLegendOpen(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendRail}
        >
          {legends.map((legend) => (
            <View key={legend.id} style={styles.legendCard}>
              <View style={styles.legendHeader}>
                <View>
                  <Text style={styles.legendName}>{legend.name}</Text>
                  <Text style={styles.legendRole}>{legend.role}</Text>
                </View>
                <Chip icon="calendar" label={legend.years} compact />
              </View>
              <Text style={styles.legendHighlight}>{legend.highlight}</Text>
            </View>
          ))}
        </ScrollView>

        <SectionHeading
          title={t("archive.sectionKits")}
          subtitle="Formalarla yolculuk: renk, kumaş, hafıza"
          icon="shirt-outline"
          onPress={() => setKitOpen(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kitRow}
        >
          {kits.map((kit) => (
            <LinearGradient
              key={kit.id}
              colors={["rgba(15,169,88,0.25)", "rgba(209,14,14,0.12)"]}
              style={styles.kitCard}
            >
              <View style={styles.kitHeader}>
                <Text style={styles.kitSeason}>{kit.season}</Text>
                <Chip icon="color-palette-outline" label={kit.title} compact />
              </View>
              <Text style={styles.kitTitle}>{kit.palette}</Text>
              <Text style={styles.kitNote}>{kit.note}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <SectionHeading
          title={t("archive.sectionMoments")}
          subtitle="Canlı anlar, şehirden stada"
          icon="camera-outline"
          onPress={() => setMomentOpen(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
          subtitle="Organizasyon, deplasman, koreografi planı"
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
              {(item as any).status === "pending" ? (
                <Chip icon="time-outline" label="Onay bekliyor" compact />
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
          subtitle="Duyurunu bize ilet, moderasyon sonrası ekleyelim"
          icon="create-outline"
        />
        <View style={styles.handoffCard}>
          <View style={styles.handoffHeader}>
            <Ionicons name="shield-checkmark" size={18} color={colors.text} />
            <Text style={styles.handoffTitle}>Duyurular moderasyonlu</Text>
          </View>
          <Text style={styles.handoffBody}>
            Taraftar güvenliği için duyuruları biz yayınlıyoruz. Detayları paylaş, kontrol edip ekleyelim.
          </Text>
          <View style={styles.handoffActions}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => setSubmitOpen(true)}
            >
              <Text style={styles.secondaryText}>Duyuru formu</Text>
              <Ionicons name="create-outline" size={14} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={archiveOpen}
        animationType="slide"
        onRequestClose={() => setArchiveOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => setArchiveOpen(false)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Arşiv Detayları</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <LinearGradient
              colors={["rgba(15,169,88,0.35)", "rgba(0,0,0,0.6)"]}
              style={styles.modalHero}
            >
              <Text style={styles.modalHeroTitle}>Takım tarihi, kupalar, maç hikayeleri</Text>
              <Text style={styles.modalHeroBody}>
                İlk kuruluştan bugünlere önemli sezonlar, dönüm maçları ve tribün koreografileri.
              </Text>
            </LinearGradient>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Dönüm Noktaları</Text>
              {archiveHighlights.map((item) => (
                <View key={item.id} style={styles.modalCard}>
                  <Text style={styles.modalCardTitle}>{item.title}</Text>
                  <Text style={styles.modalCardBody}>{item.detail}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Kupa & Unvanlar</Text>
              <Text style={styles.modalCardBody}>
                (Placeholder) Kulübün lig yükselişleri, bölgesel kupalar, tarihi derbi galibiyetleri ve taraftar ödülleri burada listelenecek.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={legendOpen}
        animationType="slide"
        onRequestClose={() => setLegendOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => setLegendOpen(false)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Efsaneler & Oyuncular</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {legends.map((legend) => (
              <View key={legend.id} style={styles.modalCard}>
                <View style={styles.legendHeader}>
                  <View>
                    <Text style={styles.legendName}>{legend.name}</Text>
                    <Text style={styles.legendRole}>{legend.role}</Text>
                  </View>
                  <Chip icon="calendar" label={legend.years} compact />
                </View>
                <Text style={styles.legendHighlight}>{legend.highlight}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={kitOpen}
        animationType="slide"
        onRequestClose={() => setKitOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => setKitOpen(false)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Forma & Koleksiyon</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {kits.map((kit) => (
              <LinearGradient
                key={kit.id}
                colors={["rgba(15,169,88,0.18)", "rgba(0,0,0,0.6)"]}
                style={styles.modalCard}
              >
                <View style={styles.kitHeader}>
                  <Text style={styles.kitSeason}>{kit.season}</Text>
                  <Chip icon="color-palette-outline" label={kit.title} compact />
                </View>
                <Text style={styles.kitTitle}>{kit.palette}</Text>
                <Text style={styles.kitNote}>{kit.note}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={momentOpen}
        animationType="slide"
        onRequestClose={() => setMomentOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => setMomentOpen(false)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Tribün Seçkisi</Text>
          </View>
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
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => setSubmitOpen(false)}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Duyuru Gönder</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.formHint}>
              Gönderilen duyurular admin onayından sonra yayınlanır.
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Başlık</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: Deplasman otobüsü"
                placeholderTextColor={colors.mutedText}
                value={submission.title}
                onChangeText={(text) => setSubmission((p) => ({ ...p, title: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Şehir</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: Diyarbakır"
                placeholderTextColor={colors.mutedText}
                value={submission.city}
                onChangeText={(text) => setSubmission((p) => ({ ...p, city: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Lokasyon</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Buluşma noktası"
                placeholderTextColor={colors.mutedText}
                value={submission.location}
                onChangeText={(text) => setSubmission((p) => ({ ...p, location: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tarih & Saat</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: 12 Aralık, 10:00"
                placeholderTextColor={colors.mutedText}
                value={submission.date}
                onChangeText={(text) => setSubmission((p) => ({ ...p, date: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>İletişim</Text>
              <TextInput
                style={styles.formInput}
                placeholder="@kullanici veya telefon"
                placeholderTextColor={colors.mutedText}
                value={submission.contact}
                onChangeText={(text) => setSubmission((p) => ({ ...p, contact: text }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Not</Text>
              <TextInput
                style={[styles.formInput, { height: 90 }]}
                placeholder="Kısa açıklama"
                placeholderTextColor={colors.mutedText}
                value={submission.note}
                onChangeText={(text) => setSubmission((p) => ({ ...p, note: text }))}
                multiline
              />
            </View>
            <Pressable style={styles.submitBtn} onPress={handleSubmitAnnouncement}>
              <Text style={styles.submitText}>Gönder ve onaya ilet</Text>
              <Ionicons name="shield-checkmark" size={16} color={colors.text} />
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

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
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
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
      style={[
        styles.badgeText,
        tone === "accent" && { color: colors.accent },
      ]}
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
      compact && { paddingVertical: spacing.xs / 2, paddingHorizontal: spacing.sm },
    ]}
  >
    <Ionicons name={icon} size={14} color={colors.text} />
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const Meta = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
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
    borderColor: "rgba(255,255,255,0.08)",
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
  heroPills: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
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
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
  timelineRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xl,
  },
  timelineCard: {
    width: 260,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  timelineCardFirst: {
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
  },
  timelineTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    paddingLeft: spacing.md + 6,
    marginBottom: spacing.xs,
  },
  timelineBody: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
    paddingLeft: spacing.md + 6,
  },
  legendRail: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xl,
  },
  legendCard: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    width: 260,
    marginRight: spacing.sm,
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
  legendRole: {
    color: colors.primary,
    fontFamily: typography.semiBold,
    marginTop: 2,
  },
  legendHighlight: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  kitRow: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  kitCard: {
    width: 240,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  kitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  kitSeason: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  kitTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.md,
    marginBottom: spacing.xs,
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
    width: 240,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: spacing.xs / 2,
    overflow: "hidden",
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
    borderColor: colors.border,
    marginBottom: spacing.xl,
    gap: spacing.sm,
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
