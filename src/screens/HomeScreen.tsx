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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { announcements, fixtureData, newsData, polls } from "../data/mockData";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<BottomTabParamList>>();
  const nextMatch = fixtureData[0];
  const featuredNews = newsData.slice(0, 3);
  const featuredPoll = polls[0];
  const headlineAnnouncement = announcements[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        <LinearGradient
          colors={["#103522", "#0D0D0D"]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroTopRow}>
            <Text style={styles.heroBadge}>Maç Günü</Text>
            <Pressable onPress={() => navigation.navigate("Fixture")}>
              <Feather name="external-link" color={colors.text} size={18} />
            </Pressable>
          </View>
          <Text style={styles.heroTitle}>Amedspor vs {nextMatch.opponent}</Text>
          <Text style={styles.heroMeta}>
            {nextMatch.date} • {nextMatch.time} • {nextMatch.venue}
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              style={styles.heroAction}
              onPress={() => navigation.navigate("Chat")}
            >
              <Ionicons name="chatbubbles-outline" size={18} color={colors.text} />
              <Text style={styles.heroActionText}>Maç Odası</Text>
            </Pressable>
            <Pressable
              style={styles.heroAction}
              onPress={() => navigation.navigate("Fixture")}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.text} />
              <Text style={styles.heroActionText}>Maç Merkezi</Text>
            </Pressable>
            <Pressable
              style={styles.heroAction}
              onPress={() => navigation.navigate("Feed")}
            >
              <Ionicons name="newspaper-outline" size={18} color={colors.text} />
              <Text style={styles.heroActionText}>Haberler</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <SectionHeader
          title="Hızlı Erişim"
          subtitle="Tüm alanlara tek dokunuş"
        />
        <View style={styles.quickGrid}>
          <QuickLink
            icon="bar-chart-2"
            label="Maç Merkezi"
            onPress={() => navigation.navigate("Fixture")}
          />
          <QuickLink
            icon="rss"
            label="Haberler"
            onPress={() => navigation.navigate("Feed")}
          />
          <QuickLink
            icon="message-square"
            label="Sohbet"
            onPress={() => navigation.navigate("Chat")}
          />
          <QuickLink
            icon="archive"
            label="Arşiv & Duyuru"
            onPress={() => navigation.navigate("Mars")}
          />
        </View>

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
              <Text style={styles.fixtureCompetition}>{fixture.competition}</Text>
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
            <Text style={styles.announcementTitle}>{headlineAnnouncement.title}</Text>
            <Ionicons name="map-outline" size={20} color={colors.text} />
          </View>
          <Text style={styles.announcementMeta}>
            {headlineAnnouncement.city} • {headlineAnnouncement.date}
          </Text>
          <Text style={styles.announcementMeta}>{headlineAnnouncement.location}</Text>
          <Text style={styles.announcementNote}>{headlineAnnouncement.note}</Text>
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

const QuickLink = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.quickLink}>
    <Feather name={icon} size={18} color={colors.text} />
    <Text style={styles.quickLinkText}>{label}</Text>
  </Pressable>
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
  heroCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heroBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  heroMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginBottom: spacing.md,
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroActionText: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
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
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickLink: {
    width: "48%",
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  quickLinkText: {
    color: colors.text,
    fontFamily: typography.medium,
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
});

export default HomeScreen;
