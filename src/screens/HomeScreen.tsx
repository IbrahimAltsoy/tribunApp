import React from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
          {fanMoments.map((moment) => (
            <Pressable key={moment.id} style={styles.momentCard}>
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
          <Pressable style={styles.momentCTA}>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={colors.text}
            />
            <Text style={styles.momentCTATitle}>Anı ekle</Text>
            <Text style={styles.momentCTASub}>Foto/video + kısa not</Text>
          </Pressable>
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
  momentCTA: {
    width: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: "rgba(15,169,88,0.05)",
  },
  momentCTATitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  momentCTASub: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
});

export default HomeScreen;
