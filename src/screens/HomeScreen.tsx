import React, { useMemo, useState, useCallback } from "react";
import {
  ImageBackground,
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
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import SectionHeader from "../components/home/SectionHeader";
import NewsCard from "../components/home/NewsCard";
import FixtureList from "../components/home/FixtureList";
import LiveTicker from "../components/home/LiveTicker";
import PollCard from "../components/home/PollCard";
import FanMomentsSection from "../components/home/FanMomentsSection";
import ShareMomentModal from "../components/home/ShareMomentModal";
import MomentDetailModal from "../components/home/MomentDetailModal";
import AllMomentsModal from "../components/home/AllMomentsModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { fanMoments, fixtureData, newsData, polls } from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { useShareMomentForm } from "../hooks/useShareMomentForm";
import { openURLSafely } from "../utils/urlValidator";
import { EXTERNAL_LINKS } from "../constants/app";

const storeImage = require("../assets/footboll/1.jpg");

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { t } = useTranslation();

  // Memoize featured news slice
  const featuredNews = useMemo(() => newsData.slice(0, 5), []);

  const [moments, setMoments] = useState(fanMoments);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<
    (typeof fanMoments)[0] | undefined
  >(undefined);

  const {
    visible: shareModalVisible,
    open: openShareModal,
    close: closeShareModal,
    city: newCity,
    caption: newCaption,
    imageUrl,
    setCity: setNewCity,
    setCaption: setNewCaption,
    setImageUrl,
    submit,
  } = useShareMomentForm();

  const momentList = useMemo(() => moments, [moments]);

  const handleOpenDetail = useCallback((moment: (typeof fanMoments)[0]) => {
    setSelectedMoment(moment);
    setDetailModalVisible(true);
  }, []);

  const handleAddMoment = useCallback(() => {
    const newMoment = submit();
    if (!newMoment) return;
    setMoments((prev) => [newMoment, ...prev]);
  }, [submit]);

  const handleNewsPress = useCallback(
    (id: string) => {
      navigation.navigate("Feed", { newsId: id, origin: "Home" });
    },
    [navigation]
  );

  const handleLanguagePress = useCallback(() => {
    setLanguageModalVisible(true);
  }, []);

  const handleStorePress = useCallback(() => {
    openURLSafely(EXTERNAL_LINKS.STORE, {
      errorTitle: t("error"),
    });
  }, [t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header onPressLanguage={handleLanguagePress} />

        <SectionHeader title={t("home.momentsTitle")} />
        <FanMomentsSection
          moments={momentList}
          onPressAdd={openShareModal}
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
            <NewsCard key={news.id} item={news} onPress={handleNewsPress} />
          ))}
        </ScrollView>

        <SectionHeader
          title={t("fixture.liveTickerTitle")}
          subtitle={t("fixture.liveTickerSubtitle")}
        />
        <LiveTicker />
        <SectionHeader title="Anket" subtitle="Haftanin maci: kim kazanir?" />
        <PollCard poll={polls[0]} />

        <SectionHeader
          title={t("home.supportTitle")}
          subtitle={t("home.supportSubtitle")}
        />
        <Pressable
          onPress={handleStorePress}
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
        onClose={closeShareModal}
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
                <Text style={styles.languageTitle}>{t("change_language")}</Text>
                <Text style={styles.languageSubtitle}>{t("greeting")}</Text>
              </View>
            </View>

            <LanguageSwitcher onClose={() => setLanguageModalVisible(false)} />
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};;

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
