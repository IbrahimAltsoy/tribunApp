import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import SectionHeader from "../components/home/SectionHeader";
import NewsCard from "../components/home/NewsCard";
import FixtureList from "../components/home/FixtureList";
import PollCard from "../components/home/PollCard";
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
  polls,
} from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const HomeScreen: React.FC = () => {
  const featuredNews = newsData.slice(0, 3);
  const featuredPoll = polls[0];
  const headlineAnnouncement = announcements[0];

  const [moments, setMoments] = useState(fanMoments);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
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

    if (!trimmedCity && !trimmedCaption && !imageUrl) return; // boş paylaşım engelle

    const newMoment = {
      id: `local-${Date.now()}`,
      user: "Sen",
      location: trimmedCity || "Şehir belirtilmedi",
      caption: trimmedCaption || "Yeni paylaşım",
      time: "Şimdi",
      source: "Tribun" as const, // tip ile %100 uyumlu, hata vermez
      image: imageUrl ? { uri: imageUrl } : undefined,
    } satisfies (typeof fanMoments)[0]; // en güvenli TypeScript kontrolü

    setMoments((prev) => [newMoment, ...prev]);

    // formu temizle
    setNewCity("");
    setNewCaption("");
    setImageUrl("");
    setShareModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        <SectionHeader
          title="Maç Günü Tribün Anları"
          // subtitle="Sağa kaydırarak taraftar videoları ve kareleri gör"
        />
        <FanMomentsSection
          moments={momentList}
          onPressAdd={() => setShareModalVisible(true)}
          onPressMore={() => setAllMomentsVisible(true)}
          onSelectMoment={handleOpenDetail}
        />

        <SectionHeader
          title="Haber Akışı"
          subtitle="Mock haberler ve tribün gelişmeleri"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsRow}
        >
          {featuredNews.map((news) => (
            <NewsCard key={news.id} item={news} />
          ))}
        </ScrollView>

        <SectionHeader
          title="Yaklaşan Maçlar"
          subtitle="Fikstür ve saat bilgisi"
        />
        <FixtureList fixtures={fixtureData} />

        <SectionHeader
          title="Anket & Tahmin"
          subtitle="Maçlara özel soru seti"
        />
        <PollCard poll={featuredPoll} />

        <SectionHeader
          title="Organizasyon Duyurusu"
          subtitle="Toplanma noktaları ve iletişim"
        />
        <AnnouncementCard announcement={headlineAnnouncement} />
      </ScrollView>

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
});

export default HomeScreen;