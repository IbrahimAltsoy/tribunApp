import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur"; // 🔥 yeni
import Header from "../components/Header";
import SectionHeader from "../components/home/SectionHeader";
import NewsCard from "../components/home/NewsCard";
import FixtureList from "../components/home/FixtureList";
import AnnouncementCard from "../components/home/AnnouncementCard";
import FanMomentsSection from "../components/home/FanMomentsSection";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
import AllMomentsModal from "../components/home/AllMomentsModal";
import {
  announcements,
  fanMoments,
  fixtureData,
  newsData,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { Ionicons } from "@expo/vector-icons";

const storeImage = require("../assets/footboll/1.jpg");

// Dil seçenekleri (bayrak yerine renk + kod)
const LANGUAGES = [
  { code: "TR", label: "Türkçe", active: true, color: "#10b981" },
  { code: "EN", label: "English", active: true, color: "#3b82f6" },
  { code: "KR", label: "Kurdî", active: false, color: "#22c55e" },
  { code: "ZAZ", label: "Zazakî", active: false, color: "#a855f7" },
  { code: "SOR", label: "Soranî", active: false, color: "#eab308" },
  { code: "AR", label: "العربية", active: false, color: "#16a34a" },
  { code: "FA", label: "فارسی", active: false, color: "#f97316" },
  { code: "DE", label: "Deutsch", active: false, color: "#ef4444" },
  { code: "FR", label: "Français", active: false, color: "#0ea5e9" },
];

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const featuredNews = newsData.slice(0, 5);
  const headlineAnnouncement = announcements[0];

  const [moments, setMoments] = useState(fanMoments);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<
    (typeof fanMoments)[0] | undefined
  >(undefined);

  const [newCity, setNewCity] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // hangi dil kartına basılı tutuluyor (scale animasyonu için)
  const [pressedLang, setPressedLang] = useState<string | null>(null);

  const momentList = useMemo(() => moments, [moments]);

  const handleOpenDetail = (moment: (typeof fanMoments)[0]) => {
    setSelectedMoment(moment);
    setDetailModalVisible(true);
  };

  const handleAddMoment = () => {
    const trimmedCity = newCity.trim();
    const trimmedCaption = newCaption.trim();

    if (!trimmedCity && !trimmedCaption && !imageUrl) return;

    const newMoment = {
      id: `local-${Date.now()}`,
      user: "Sen",
      location: trimmedCity || "Sehir belirtilmedi",
      caption: trimmedCaption || "Yeni paylasim",
      time: "Simdi",
      source: "Tribun" as const,
      image: imageUrl ? { uri: imageUrl } : undefined,
    } satisfies (typeof fanMoments)[0];

    setMoments((prev) => [newMoment, ...prev]);
    setNewCity("");
    setNewCaption("");
    setImageUrl("");
    setShareModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header onPressLanguage={() => setLanguageModalVisible(true)} />

        <SectionHeader title="Mac Gunu Tribun Anlari" />
        <FanMomentsSection
          moments={momentList}
          onPressAdd={() => setShareModalVisible(true)}
          onPressMore={() => setAllMomentsVisible(true)}
          onSelectMoment={handleOpenDetail}
        />

        <SectionHeader
          title="Haber Akisi"
          subtitle="Mock haberler ve tribun gelismeleri"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsRow}
        >
          {featuredNews.map((news) => (
            <NewsCard
              key={news.id}
              item={news}
              onPress={(id) =>
                navigation.navigate("Feed", { newsId: id, origin: "Home" })
              }
            />
          ))}
        </ScrollView>

        <SectionHeader
          title="Yaklasan Maclar"
          subtitle="Fikstur ve saat bilgisi"
        />
        <FixtureList fixtures={fixtureData} />

        <SectionHeader
          title="Takimina Destek Ol"
          subtitle="AmedStore.com ile renklerini tasin"
        />
        <Pressable
          onPress={() => Linking.openURL("https://amedstore.com")}
          style={styles.supportCard}
          accessibilityRole="button"
        >
          <ImageBackground
            source={storeImage}
            style={styles.supportImage}
            imageStyle={{ borderRadius: 18 }}
          >
            <View style={styles.supportOverlay} />
            <View style={styles.supportContent}>
              <Text style={styles.supportPill}>Store</Text>
              <Text style={styles.supportTitle}>AmedStore.com</Text>
              <Text style={styles.supportSubtitle}>
                Formalar, atkilar ve lisansli urunler icin tikla.
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

        <SectionHeader
          title="Organizasyon Duyurusu"
          subtitle="Toplanma noktalarini ve iletisim kanallarini yakala"
        />
        <AnnouncementCard announcement={headlineAnnouncement} />
      </ScrollView>

      {/* PAYLAŞ / DETAY / TÜM ANLAR MODALLARI (ESKİ HALİYLE) */}
      <ShareMomentModal
        visible={shareModalVisible}
        newCity={newCity}
        newCaption={newCaption}
        imageUrl={imageUrl}
        onChangeCity={setNewCity}
        onChangeCaption={setNewCaption}
        onChangeImageUrl={setImageUrl}
        onSubmit={handleAddMoment}
        onClose={() => setShareModalVisible(false)}
      />

      <MomentDetailModal
        visible={detailModalVisible}
        moment={selectedMoment}
        onClose={() => setDetailModalVisible(false)}
      />

      <AllMomentsModal
        visible={allMomentsVisible}
        moments={momentList}
        onClose={() => setAllMomentsVisible(false)}
        onSelect={(moment) => {
          setSelectedMoment(moment);
          setAllMomentsVisible(false);
          setDetailModalVisible(true);
        }}
      />

      {/* ======== YENİ DİL MODALI (PREMIUM TASARIM) ======== */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <BlurView intensity={65} tint="dark" style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            {/* Başlık Bloğu */}
            <View style={styles.languageHeaderRow}>
              <View style={styles.languageIconCircle}>
                <Ionicons name="globe-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.languageTitle}>Dil ve Bölge</Text>
                <Text style={styles.languageSubtitle}>
                  Su anda varsayilan dil kullaniliyor. Cok yakinda coklu dil
                  seceneklerini burada aktiflestirebileceksin.
                </Text>
              </View>
            </View>

            {/* Dil Kartları Grid */}
            <View style={styles.languageGrid}>
              {LANGUAGES.map((lang) => {
                const isActive = lang.active;
                const isPressed = pressedLang === lang.code;

                return (
                  <Pressable
                    key={lang.code}
                    onPressIn={() => setPressedLang(lang.code)}
                    onPressOut={() => setPressedLang(null)}
                    disabled={!isActive}
                    style={[
                      styles.languageCard,
                      { borderColor: lang.color },
                      !isActive && styles.languageCardDisabled,
                      isPressed && styles.languageCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.languageBadge,
                        { backgroundColor: lang.color },
                      ]}
                    >
                      <Text style={styles.languageBadgeText}>{lang.code}</Text>
                    </View>
                    <Text style={styles.langName}>{lang.label}</Text>
                    <Text style={styles.langHint}>
                      {isActive ? "Ornek arayuz dili" : "Yakinda"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Alt Bilgi & Kapat */}
            <View style={styles.languageFooter}>
              <View style={styles.languageLegendRow}>
                <View style={styles.legendDotActive} />
                <Text style={styles.legendText}>Aktif diller</Text>
                <View style={styles.legendDotSoon} />
                <Text style={styles.legendText}>Yakinda acilacak</Text>
              </View>
              <Pressable
                onPress={() => setLanguageModalVisible(false)}
                style={styles.modalClose}
                accessibilityRole="button"
              >
                <Text style={styles.modalCloseText}>Kapat</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  newsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  supportCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportImage: {
    height: 160,
    justifyContent: "flex-end",
  },
  supportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  supportContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  supportPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15,169,88,0.9)",
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  supportTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  supportSubtitle: {
    color: colors.text,
    fontFamily: typography.medium,
  },

  // -------- Dil Modalı (yeni tasarım) --------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  languageModal: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(10,10,10,0.96)",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  languageHeaderRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  languageIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs / 2,
  },
  languageSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  languageCard: {
    width: "30%",
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.card,
    alignItems: "center",
    gap: spacing.xs / 2,
    borderWidth: 1,
  },
  languageCardDisabled: {
    opacity: 0.5,
  },
  languageCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  languageBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  languageBadgeText: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
  },
  langName: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  langHint: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  languageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  languageLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  legendDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  legendDotSoon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mutedText,
  },
  legendText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginRight: spacing.sm,
  },
  modalClose: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  modalCloseText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
});

export default HomeScreen;
