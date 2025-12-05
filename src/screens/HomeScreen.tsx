import React, { useMemo, useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  ImageBackground,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { announcements, fixtureData, newsData, polls } from "../data/mockData";
import { fanMoments } from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<BottomTabParamList>>();
  const featuredNews = newsData.slice(0, 3);
  const featuredPoll = polls[0];
  const headlineAnnouncement = announcements[0];
  const [moments, setMoments] = useState(fanMoments);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [allMomentsVisible, setAllMomentsVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] =
    useState<(typeof fanMoments)[0]>();
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
    const id = `local-${Date.now()}`;
    const next = {
      id,
      user: "Sen",
      location: trimmedCity || "Şehir belirtilmedi",
      caption: trimmedCaption || "Yeni paylaşım",
      time: "şimdi",
      source: "Tribün",
      image: imageUrl ? { uri: imageUrl } : undefined,
    } as (typeof fanMoments)[0];

    setMoments((prev) => [next, ...prev]);
    setShareModalVisible(false);
    setNewCity("");
    setNewCaption("");
    setImageUrl("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        <SectionHeader
          title="Maç Günü Tribün Anları"
          subtitle="Sağa kaydırarak taraftar videoları ve kareler"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.momentsRow}
        >
          <Pressable
            style={styles.momentAddCard}
            onPress={() => setShareModalVisible(true)}
          >
            <View style={styles.momentAddIcon}>
              <Ionicons name="add" size={20} color={colors.text} />
            </View>
            <Text style={styles.momentAddTitle}>Anı Paylaş</Text>
            <Text style={styles.momentAddSub}>
              Şehir, kısa not ve görsel ekle
            </Text>
          </Pressable>
          {momentList.slice(0, 5).map((moment) => (
            <Pressable
              key={moment.id}
              style={styles.momentCard}
              onPress={() => handleOpenDetail(moment)}
            >
              {moment.image ? (
                <ImageBackground
                  source={moment.image}
                  style={styles.momentImage}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.momentContent}>
                    <View style={styles.momentSourcePill}>
                      <Text style={styles.momentSourceText}>
                        {moment.source}
                      </Text>
                    </View>
                    <Text style={styles.momentCaption}>{moment.caption}</Text>
                    <Text style={styles.momentLocation}>{moment.location}</Text>
                    <Text style={styles.momentTime}>{moment.time} önce</Text>
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.momentImage, styles.momentFallback]}>
                  <Text style={styles.momentCaption}>{moment.caption}</Text>
                  <Text style={styles.momentLocation}>{moment.location}</Text>
                  <Text style={styles.momentTime}>{moment.time} önce</Text>
                </View>
              )}
            </Pressable>
          ))}
          {momentList.length > 5 && (
            <Pressable
              style={styles.momentMoreCard}
              onPress={() => setAllMomentsVisible(true)}
            >
              <Ionicons
                name="albums-outline"
                size={22}
                color={colors.accentLight}
              />
              <Text style={styles.momentMoreTitle}>Daha fazlası</Text>
              <Text style={styles.momentMoreSub}>Tüm tribün anlarını gör</Text>
            </Pressable>
          )}
        </ScrollView>

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
        <View style={styles.fixtureList}>
          {fixtureData.map((fixture) => (
            <View key={fixture.id} style={styles.fixtureCard}>
              <View style={styles.fixtureRow}>
                <View>
                  <Text style={styles.fixtureOpponent}>Amedspor</Text>
                  <Text style={styles.fixtureVs}>vs {fixture.opponent}</Text>
                  <Text style={styles.fixtureMeta}>
                    {fixture.date} • {fixture.time}
                  </Text>
                  <Text style={styles.fixtureVenue}>{fixture.venue}</Text>
                </View>
                <View style={styles.fixtureTag}>
                  <Text style={styles.fixtureTagText}>
                    {fixture.isHome ? "İç Saha" : "Deplasman"}
                  </Text>
                </View>
              </View>
              <Text style={styles.fixtureCompetition}>
                {fixture.competition}
              </Text>
            </View>
          ))}
        </View>

        <SectionHeader
          title="Anket & Tahmin"
          subtitle="Maçlara özel soru seti"
        />
        <PollCard poll={featuredPoll} />

        <SectionHeader
          title="Organizasyon Duyurusu"
          subtitle="Toplanma noktaları ve iletişim"
        />
        <View style={styles.announcementCard}>
          <View style={styles.announcementHeader}>
            <Text style={styles.announcementTitle}>
              {headlineAnnouncement.title}
            </Text>
            <Ionicons name="map-outline" size={20} color={colors.text} />
          </View>
          <Text style={styles.announcementMeta}>
            {headlineAnnouncement.city} • {headlineAnnouncement.date}
          </Text>
          <Text style={styles.announcementMeta}>
            {headlineAnnouncement.location}
          </Text>
          <Text style={styles.announcementNote}>
            {headlineAnnouncement.note}
          </Text>
          <Text style={styles.announcementContact}>
            İletişim: {headlineAnnouncement.contact}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCard}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tribün Anı Paylaş</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Şehir / Lokasyon"
              placeholderTextColor={colors.mutedText}
              value={newCity}
              onChangeText={setNewCity}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Kısa açıklama"
              placeholderTextColor={colors.mutedText}
              value={newCaption}
              onChangeText={setNewCaption}
              style={[styles.modalInput, { height: 80 }]}
              multiline
            />
            <TextInput
              placeholder="Görsel URL (opsiyonel)"
              placeholderTextColor={colors.mutedText}
              value={imageUrl}
              onChangeText={setImageUrl}
              style={styles.modalInput}
              autoCapitalize="none"
            />
            {imageUrl ? (
              <View style={styles.previewBox}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddMoment}
            >
              <Text style={styles.modalButtonText}>Ekle</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <TouchableOpacity
              style={styles.detailClose}
              onPress={() => setDetailModalVisible(false)}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            {selectedMoment?.image ? (
              <ImageBackground
                source={selectedMoment.image}
                style={styles.detailImage}
                imageStyle={{ borderRadius: 16 }}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.25)"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </ImageBackground>
            ) : (
              <View style={[styles.detailImage, styles.momentFallback]}>
                <Text style={styles.momentCaption}>
                  {selectedMoment?.caption}
                </Text>
              </View>
            )}
            <View style={styles.detailContent}>
              <View style={styles.momentSourcePill}>
                <Text style={styles.momentSourceText}>
                  {selectedMoment?.source}
                </Text>
              </View>
              <Text style={styles.detailCaption}>
                {selectedMoment?.caption}
              </Text>
              <Text style={styles.detailMeta}>
                {selectedMoment?.location} · {selectedMoment?.time} önce
              </Text>
              <Text style={styles.detailMeta}>
                Paylaşan: {selectedMoment?.user}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={allMomentsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAllMomentsVisible(false)}
      >
        <View style={styles.allOverlay}>
          <View style={styles.allCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TÇ¬m TribÇ¬n AnlarŽñ</Text>
              <TouchableOpacity onPress={() => setAllMomentsVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.allList}
              showsVerticalScrollIndicator={false}
            >
              {momentList.map((moment) => (
                <Pressable
                  key={moment.id}
                  style={styles.allItem}
                  onPress={() => {
                    setSelectedMoment(moment);
                    setAllMomentsVisible(false);
                    setDetailModalVisible(true);
                  }}
                >
                  {moment.image ? (
                    <ImageBackground
                      source={moment.image}
                      style={styles.allImage}
                      imageStyle={{ borderRadius: 12 }}
                    >
                      <LinearGradient
                        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)"]}
                        style={StyleSheet.absoluteFillObject}
                      />
                    </ImageBackground>
                  ) : (
                    <View style={[styles.allImage, styles.momentFallback]} />
                  )}
                  <View style={styles.allText}>
                    <View style={styles.momentSourcePill}>
                      <Text style={styles.momentSourceText}>
                        {moment.source}
                      </Text>
                    </View>
                    <Text style={styles.allCaption}>{moment.caption}</Text>
                    <Text style={styles.allMeta}>
                      {moment.location} ƒ?½ {moment.time} Çônce
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.sectionAccent} />
  </View>
);

const NewsCard = ({ item }: { item: (typeof newsData)[0] }) => {
  const body = (
    <View style={styles.newsContent}>
      <View style={styles.newsPill}>
        <Text style={styles.newsPillText}>{item.category}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{item.summary}</Text>
      <Text style={styles.newsMeta}>{item.time} önce</Text>
    </View>
  );

  if (item.image) {
    return (
      <Pressable style={styles.newsCard}>
        <ImageBackground
          source={item.image}
          style={styles.newsImage}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)"]}
            style={StyleSheet.absoluteFillObject}
          />
          {body}
        </ImageBackground>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.newsCard, styles.newsCardPlain]}>
      <LinearGradient
        colors={["rgba(15,169,88,0.15)", "rgba(209,14,14,0.08)"]}
        style={[styles.newsImage, { borderRadius: 16 }]}
      >
        {body}
      </LinearGradient>
    </Pressable>
  );
};

const PollCard = ({ poll }: { poll: (typeof polls)[0] }) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  return (
    <View style={styles.pollCard}>
      <View style={styles.pollHeader}>
        <Text style={styles.pollTitle}>{poll.question}</Text>
        <Text style={styles.pollMeta}>{poll.closesIn} kaldı</Text>
      </View>
      {poll.options.map((opt) => {
        const pct = Math.round((opt.votes / totalVotes) * 100);
        return (
          <View key={opt.id} style={styles.pollOption}>
            <View style={styles.pollRow}>
              <Text style={styles.pollOptionText}>{opt.text}</Text>
              <Text style={styles.pollOptionText}>{pct}%</Text>
            </View>
            <View style={styles.pollBarBackground}>
              <View style={[styles.pollBarFill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      })}
      <Text style={styles.pollFooter}>{totalVotes} oy</Text>
    </View>
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
  sectionHeader: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontFamily: typography.semiBold,
  },
  sectionSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs / 2,
  },
  sectionAccent: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  newsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  newsCard: {
    width: 260,
    height: 180,
  },
  newsCardPlain: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  newsImage: {
    flex: 1,
  },
  newsContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  newsPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15,169,88,0.8)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 10,
  },
  newsPillText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  newsTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  newsSummary: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  newsMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  fixtureList: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  fixtureCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixtureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  fixtureOpponent: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  fixtureVs: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    marginTop: spacing.xs / 2,
  },
  fixtureMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginTop: spacing.xs,
  },
  fixtureVenue: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  fixtureTag: {
    backgroundColor: "rgba(209,14,14,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(209,14,14,0.4)",
  },
  fixtureTagText: {
    color: colors.accent,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  fixtureCompetition: {
    color: colors.mutedText,
    marginTop: spacing.xs,
    fontFamily: typography.medium,
  },
  pollCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pollTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    flex: 1,
  },
  pollMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  pollOption: {
    gap: spacing.xs,
  },
  pollRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pollOptionText: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  pollBarBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  pollBarFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pollFooter: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  announcementCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
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
  momentsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  momentCard: {
    width: 220,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  momentAddCard: {
    width: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(15,169,88,0.08)",
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center",
  },
  momentAddIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    // borderColor: colors.primary,
    borderColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  momentAddTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentAddSub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentMoreCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center",
  },
  momentMoreTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentMoreSub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentImage: {
    height: 200,
  },
  momentContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  momentSourcePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15,169,88,0.8)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  momentSourceText: {
    color: colors.text,

    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  momentCaption: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  momentLocation: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  momentTime: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  momentFallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.medium,
  },
  previewBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: 160,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  modalButtonText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  allOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing.lg,
  },
  allCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  allItem: {
    flexDirection: "row",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  allImage: {
    width: 110,
    height: 90,
  },
  allText: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    gap: spacing.xs,
    justifyContent: "center",
  },
  allCaption: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
  },
  allMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  detailCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailClose: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 14,
    padding: spacing.xs,
  },
  detailImage: {
    height: 260,
  },
  detailContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  detailCaption: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  detailMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
});

export default HomeScreen;
