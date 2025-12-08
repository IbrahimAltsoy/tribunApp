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
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur"; // 🔥 yeni
import Header from "../components/Header";
import SectionHeader from "../components/home/SectionHeader";
import NewsCard from "../components/home/NewsCard";
import FixtureList from "../components/home/FixtureList";
import FanMomentsSection from "../components/home/FanMomentsSection";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
import AllMomentsModal from "../components/home/AllMomentsModal";
import {
  fanMoments,
  fixtureData,
  newsData,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const storeImage = require("../assets/footboll/1.jpg");


const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { t } = useTranslation();
  const featuredNews = newsData.slice(0, 5);

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

        <SectionHeader title={t("home.momentsTitle")} />
        <FanMomentsSection
          moments={momentList}
          onPressAdd={() => setShareModalVisible(true)}
          onPressMore={() => setAllMomentsVisible(true)}
          onSelectMoment={handleOpenDetail}
        />

        <SectionHeader
          title={t("home.newsTitle")}
          subtitle={t("home.newsSubtitle")}
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
          title={t("home.fixturesTitle")}
          subtitle={t("home.fixturesSubtitle")}
        />
        <FixtureList fixtures={fixtureData} />

        <SectionHeader
          title={t("home.supportTitle")}
          subtitle={t("home.supportSubtitle")}
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
              <Text style={styles.supportPill}>{t("home.supportPill")}</Text>
              <Text style={styles.supportTitle}>{t("home.supportStore")}</Text>
              <Text style={styles.supportSubtitle}>
                {t("home.supportSubtitle")}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

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

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <BlurView intensity={65} tint="dark" style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <View style={styles.languageHeaderRow}>
              <View style={styles.languageIconCircle}>
                <Ionicons name="globe-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.languageTitle}>{t('change_language')}</Text>
                <Text style={styles.languageSubtitle}>{t('greeting')}</Text>
              </View>
            </View>

            <LanguageSwitcher
              onClose={() => setLanguageModalVisible(false)}
            />
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
});

export default HomeScreen;
