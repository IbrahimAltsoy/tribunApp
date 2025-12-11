import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography, lineHeights } from "../theme/typography";
import { shadows } from "../theme/colors";
import { BottomTabParamList } from "../navigation/BottomTabs";
import { openURLSafely } from "../utils/urlValidator";
import { EXTERNAL_LINKS } from "../constants/app";
import {
  fanMoments,
  fixtureData,
  newsData,
  polls,
} from "../data/mockData";
import LanguageSwitcher from "../components/LanguageSwitcher";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HORIZONTAL_MARGIN = spacing.lg;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2;

// Placeholder stadium image for Live Match Card
const stadiumImage = require("../assets/footboll/1.jpg");

// ============================================================================
// SECTION 1: HERO GREETING
// ============================================================================
const HeroGreeting: React.FC<{
  onPressLanguage: () => void;
  onPressNotifications?: () => void;
}> = ({ onPressLanguage, onPressNotifications }) => {
  const { t } = useTranslation();

  // Get current date
  const currentDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={styles.heroGreetingContainer}
    >
      {/* Top-right icons */}
      <View style={styles.heroIconsRow}>
        <Pressable
          onPress={onPressLanguage}
          style={styles.heroIcon}
          hitSlop={12}
        >
          <Ionicons
            name="globe-outline"
            size={24}
            color={colors.textTertiary}
            style={{ opacity: 0.6 }}
          />
        </Pressable>

        {onPressNotifications && (
          <Pressable
            onPress={onPressNotifications}
            style={styles.heroIcon}
            hitSlop={12}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textTertiary}
              style={{ opacity: 0.6 }}
            />
            {/* Badge */}
            <View style={styles.notificationBadge} />
          </Pressable>
        )}
      </View>

      {/* Greeting Text with Gradient Effect */}
      <Text style={styles.heroGreeting}>
        {t("greeting")} 💛❤️
      </Text>

      {/* Subtitle: Date + Location */}
      <Text style={styles.heroSubtitle}>
        {currentDate} • Diyarbakır
      </Text>
    </Animated.View>
  );
};

// ============================================================================
// SECTION 2: LIVE MATCH HERO CARD
// ============================================================================
const LiveMatchCard: React.FC = () => {
  const { t } = useTranslation();

  // Mock live match data
  const liveMatch = {
    isLive: true,
    minute: "67'",
    homeTeam: "Amedspor",
    awayTeam: "Kocaelispor",
    homeScore: 2,
    awayScore: 1,
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (!liveMatch.isLive) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600)}
      style={styles.liveMatchContainer}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: "100%" }}
      >
        <Animated.View style={[styles.liveMatchCard, animatedStyle]}>
          {/* Background Image with Blur */}
          <ImageBackground
            source={stadiumImage}
            style={styles.liveMatchBackground}
            imageStyle={styles.liveMatchBackgroundImage}
            blurRadius={8}
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={colors.gradientHero}
              style={StyleSheet.absoluteFill}
            />

            {/* Frosted Glass Overlay */}
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill}>
              {/* Live Indicator (Top-Left) */}
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>CANLI • {liveMatch.minute}</Text>
              </View>

              {/* Score Display (Center) */}
              <View style={styles.scoreContainer}>
                {/* Team Names */}
                <View style={styles.teamNamesRow}>
                  <Text style={styles.teamName}>{liveMatch.homeTeam}</Text>
                  <Text style={styles.teamName}>{liveMatch.awayTeam}</Text>
                </View>

                {/* Score */}
                <Text style={styles.scoreText}>
                  {liveMatch.homeScore} - {liveMatch.awayScore}
                </Text>
              </View>

              {/* Bottom Action Bar */}
              <BlurView intensity={60} tint="dark" style={styles.liveActionBar}>
                <Pressable style={styles.liveActionPrimary}>
                  <Text style={styles.liveActionPrimaryText}>
                    İZLE CANLI →
                  </Text>
                </Pressable>

                <View style={styles.liveActionDivider} />

                <Pressable style={styles.liveActionSecondary}>
                  <Text style={styles.liveActionSecondaryText}>ETKİNLİK</Text>
                </Pressable>
              </BlurView>
            </BlurView>
          </ImageBackground>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// SECTION 3: QUICK ACTIONS GRID
// ============================================================================
const QuickActions: React.FC<{ onPressStore: () => void }> = ({
  onPressStore,
}) => {
  const actions = [
    { icon: "ticket-outline", label: "Biletler", onPress: () => {} },
    { icon: "bag-handle-outline", label: "Mağaza", onPress: onPressStore },
    { icon: "calendar-outline", label: "Takvim", onPress: () => {} },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600)}
      style={styles.quickActionsContainer}
    >
      {actions.map((action, index) => (
        <QuickActionCard
          key={action.label}
          icon={action.icon as any}
          label={action.label}
          onPress={action.onPress}
          delay={index * 50}
        />
      ))}
    </Animated.View>
  );
};

const QuickActionCard: React.FC<{
  icon: any;
  label: string;
  onPress: () => void;
  delay: number;
}> = ({ icon, label, onPress, delay }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + delay).duration(500)}
      style={styles.quickActionCard}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: "100%", height: "100%" }}
      >
        <Animated.View style={[styles.quickActionContent, animatedStyle]}>
          <BlurView
            intensity={25}
            tint="dark"
            style={styles.quickActionBlur}
          >
            <Ionicons name={icon} size={28} color={colors.primary} />
            <Text style={styles.quickActionLabel}>{label}</Text>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// SECTION 4: FAN MOMENTS CAROUSEL
// ============================================================================
const FanMomentsSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const moments = useMemo(() => fanMoments.slice(0, 3), []);

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(600)}
      style={styles.fanMomentsSection}
    >
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tribun Anları</Text>
        <Pressable>
          <Text style={styles.sectionAction}>Tümünü Gör →</Text>
        </Pressable>
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.momentsCarousel}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12)
          );
          setCurrentPage(page);
        }}
      >
        {moments.map((moment) => (
          <MomentCard key={moment.id} moment={moment} />
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.pageIndicators}>
        {moments.map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              currentPage === index && styles.pageIndicatorActive,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const MomentCard: React.FC<{ moment: any }> = ({ moment }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginRight: 12 }}
    >
      <Animated.View style={[styles.momentCard, animatedStyle]}>
        {/* Photo */}
        <Image
          source={{ uri: moment.imageUrl }}
          style={styles.momentPhoto}
          defaultSource={stadiumImage}
        />

        {/* Content */}
        <View style={styles.momentContent}>
          <Text style={styles.momentCaption} numberOfLines={2}>
            {moment.caption}
          </Text>

          <Text style={styles.momentMeta}>
            {moment.city} • {moment.timeAgo}
          </Text>

          {/* Reactions */}
          <View style={styles.momentReactions}>
            <View style={styles.reactionItem}>
              <Text style={styles.reactionIcon}>❤️</Text>
              <Text style={styles.reactionCount}>{moment.likes}</Text>
            </View>
            <View style={styles.reactionItem}>
              <Text style={styles.reactionIcon}>💬</Text>
              <Text style={styles.reactionCount}>{moment.comments}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ============================================================================
// SECTION 5: LATEST NEWS (VERTICAL STACK)
// ============================================================================
const LatestNewsSection: React.FC<{ onPressNews: (id: string) => void }> = ({
  onPressNews,
}) => {
  const news = useMemo(() => newsData.slice(0, 3), []);

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(600)}
      style={styles.newsSection}
    >
      {/* Section Header */}
      <Text style={styles.sectionTitle}>Son Haberler</Text>

      {/* News Cards */}
      <View style={styles.newsCardsContainer}>
        {news.map((item, index) => (
          <NewsCard
            key={item.id}
            news={item}
            onPress={() => onPressNews(item.id)}
            delay={index * 50}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const NewsCard: React.FC<{
  news: any;
  onPress: () => void;
  delay: number;
}> = ({ news, onPress, delay }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(400 + delay).duration(500)}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.newsCard, animatedStyle]}>
          {/* Image */}
          <Image
            source={{ uri: news.imageUrl }}
            style={styles.newsImage}
            defaultSource={stadiumImage}
          />

          {/* Content */}
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle} numberOfLines={2}>
              {news.title}
            </Text>
            <Text style={styles.newsExcerpt} numberOfLines={2}>
              {news.description}
            </Text>
            <View style={styles.newsMeta}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.textTertiary}
              />
              <Text style={styles.newsMetaText}>
                {news.timeAgo} • {news.category}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// SECTION 6: COMMUNITY POLL
// ============================================================================
const CommunityPollSection: React.FC = () => {
  const poll = polls[0];
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <Animated.View
      entering={FadeInDown.delay(500).duration(600)}
      style={styles.pollSection}
    >
      {/* Section Header */}
      <Text style={styles.sectionTitle}>Saha Sesi</Text>

      {/* Poll Card */}
      <View style={styles.pollCard}>
        <Text style={styles.pollQuestion}>{poll.question}</Text>

        {/* Options */}
        <View style={styles.pollOptions}>
          {poll.options.map((option, index) => {
            const percentage = Math.round((option.votes / totalVotes) * 100);
            const isLeader = index === 0;

            return (
              <PollOption
                key={option.id}
                option={option}
                percentage={percentage}
                isLeader={isLeader}
                delay={index * 100}
              />
            );
          })}
        </View>

        {/* Footer Meta */}
        <View style={styles.pollFooter}>
          <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.pollFooterText}>
            {poll.closesIn} içinde kapanıyor • {totalVotes} oy
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const PollOption: React.FC<{
  option: any;
  percentage: number;
  isLeader: boolean;
  delay: number;
}> = ({ option, percentage, isLeader, delay }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(percentage, { duration: 800 });
  }, [percentage]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(500 + delay).duration(500)}
      style={styles.pollOptionRow}
    >
      <Text style={styles.pollOptionLabel}>{option.text}</Text>

      <View style={styles.pollBarContainer}>
        <View style={styles.pollBarBackground}>
          <Animated.View style={[styles.pollBarFill, animatedBarStyle]}>
            <LinearGradient
              colors={
                isLeader ? colors.gradientPrimary : [colors.textTertiary, colors.textTertiary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.pollOptionStats}>
        {percentage}% [{option.votes}]
      </Text>
    </Animated.View>
  );
};

// ============================================================================
// SECTION 7: SUPPORT CTA
// ============================================================================
const SupportCTA: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(600).duration(600)}
      style={styles.supportCTAContainer}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.supportCTACard, animatedStyle]}>
          <LinearGradient
            colors={colors.gradientAccentSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <BlurView intensity={40} tint="dark" style={styles.supportCTAContent}>
            <Ionicons name="bag-handle-outline" size={48} color={colors.primary} />
            <Text style={styles.supportCTATitle}>Kulübünü Destekle</Text>
            <Text style={styles.supportCTASubtitle}>
              Resmi mağazadan destek ol, forma al
            </Text>

            <View style={styles.supportCTAButton}>
              <Text style={styles.supportCTAButtonText}>MAĞAZAYA GİT →</Text>
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// MAIN HOMESCREEN COMPONENT
// ============================================================================
const HomeScreen2025: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { t } = useTranslation();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguagePress = useCallback(() => {
    setLanguageModalVisible(true);
  }, []);

  const handleNewsPress = useCallback(
    (id: string) => {
      navigation.navigate("Feed", { newsId: id, origin: "Home" });
    },
    [navigation]
  );

  const handleStorePress = useCallback(() => {
    openURLSafely(EXTERNAL_LINKS.STORE, {
      errorTitle: t("error"),
    });
  }, [t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Hero Greeting */}
        <HeroGreeting onPressLanguage={handleLanguagePress} />

        {/* SECTION 2: Live Match Hero Card */}
        <LiveMatchCard />

        {/* SECTION 3: Quick Actions Grid */}
        <QuickActions onPressStore={handleStorePress} />

        {/* SECTION 4: Fan Moments Carousel */}
        <FanMomentsSection />

        {/* SECTION 5: Latest News */}
        <LatestNewsSection onPressNews={handleNewsPress} />

        {/* SECTION 6: Community Poll */}
        <CommunityPollSection />

        {/* SECTION 7: Support CTA */}
        <SupportCTA onPress={handleStorePress} />
      </ScrollView>

      {/* Language Modal */}
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

            <LanguageSwitcher
              onClose={() => setLanguageModalVisible(false)}
            />
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES (2025 LUXURY DESIGN SYSTEM)
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },

  // ========== HERO GREETING ==========
  heroGreetingContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  heroIconsRow: {
    position: "absolute",
    top: spacing.xxxl,
    right: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    zIndex: 10,
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },
  heroGreeting: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xxxl,
    color: colors.text,
    letterSpacing: -1,
    lineHeight: lineHeights.xl,
  },
  heroSubtitle: {
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    opacity: 0.7,
    marginTop: spacing.xs,
  },

  // ========== LIVE MATCH CARD ==========
  liveMatchContainer: {
    paddingHorizontal: 0,
    marginTop: spacing.xl,
  },
  liveMatchCard: {
    height: 240,
    marginHorizontal: 0,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.xl,
    shadowColor: colors.shadowMedium,
  },
  liveMatchBackground: {
    width: "100%",
    height: "100%",
  },
  liveMatchBackgroundImage: {
    opacity: 0.4,
  },
  liveIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(209, 14, 14, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  liveText: {
    fontFamily: typography.bold,
    fontSize: fontSizes.sm,
    color: colors.text,
    textTransform: "uppercase",
  },
  scoreContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  teamNamesRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  teamName: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.base,
    color: colors.text,
  },
  scoreText: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xxxl,
    color: colors.white,
    letterSpacing: 2,
    textShadowColor: colors.shadowMedium,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  liveActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
  },
  liveActionPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  liveActionPrimaryText: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  liveActionDivider: {
    width: 1,
    backgroundColor: colors.glassStroke,
  },
  liveActionSecondary: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  liveActionSecondaryText: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
  },

  // ========== QUICK ACTIONS ==========
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    height: 88,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  quickActionContent: {
    width: "100%",
    height: "100%",
  },
  quickActionBlur: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.cardSubtle,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    ...shadows.sm,
    shadowColor: colors.shadowSoft,
  },
  quickActionLabel: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
    color: colors.text,
  },

  // ========== FAN MOMENTS ==========
  fanMomentsSection: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  sectionAction: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  momentsCarousel: {
    paddingHorizontal: spacing.lg,
  },
  momentCard: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: radii.xl,
    backgroundColor: colors.cardPrimary,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
    ...shadows.md,
    shadowColor: colors.shadowMedium,
  },
  momentPhoto: {
    width: "100%",
    height: 140,
  },
  momentContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  momentCaption: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.base,
    color: colors.text,
  },
  momentMeta: {
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },
  momentReactions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reactionIcon: {
    fontSize: 18,
  },
  reactionCount: {
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  pageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  pageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textQuaternary,
    opacity: 0.4,
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary,
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },

  // ========== NEWS SECTION ==========
  newsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  newsCardsContainer: {
    marginTop: spacing.md,
    gap: 12,
  },
  newsCard: {
    flexDirection: "row",
    height: 120,
    borderRadius: radii.lg,
    backgroundColor: colors.cardPrimary,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    overflow: "hidden",
    ...shadows.sm,
    shadowColor: colors.shadowSoft,
  },
  newsImage: {
    width: 120,
    height: "100%",
  },
  newsContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md + 1,
    color: colors.text,
  },
  newsExcerpt: {
    fontFamily: typography.regular,
    fontSize: fontSizes.sm + 1,
    color: colors.textSecondary,
  },
  newsMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  newsMetaText: {
    fontFamily: typography.medium,
    fontSize: fontSizes.xs + 1,
    color: colors.textTertiary,
  },

  // ========== POLL SECTION ==========
  pollSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pollCard: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.cardPrimary,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    padding: spacing.lg,
    ...shadows.md,
    shadowColor: colors.shadowMedium,
  },
  pollQuestion: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg - 2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  pollOptions: {
    gap: 12,
  },
  pollOptionRow: {
    gap: spacing.xs,
  },
  pollOptionLabel: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: 6,
  },
  pollBarContainer: {
    marginBottom: 4,
  },
  pollBarBackground: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.backgroundElevated,
    overflow: "hidden",
  },
  pollBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  pollOptionStats: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  pollFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  pollFooterText: {
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },

  // ========== SUPPORT CTA ==========
  supportCTAContainer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  supportCTACard: {
    height: 200,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.lg,
    shadowColor: colors.shadowHeavy,
  },
  supportCTAContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  supportCTATitle: {
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
    color: colors.text,
  },
  supportCTASubtitle: {
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  supportCTAButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 22,
    marginTop: spacing.xs,
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  supportCTAButtonText: {
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    color: colors.text,
    textTransform: "uppercase",
  },

  // ========== LANGUAGE MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  languageModal: {
    width: "100%",
    borderRadius: radii.xl,
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

export default HomeScreen2025;
