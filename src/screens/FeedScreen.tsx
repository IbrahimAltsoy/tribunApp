import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { NewsItem, newsData } from "../data/mockData";
import { BottomTabParamList } from "../navigation/BottomTabs";

const ALL_CATEGORY_CODE = "__all__";

const FeedScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const route = useRoute<RouteProp<BottomTabParamList, "Feed">>();
  const { t } = useTranslation();

  const categoryValues = useMemo(
    () => Array.from(new Set(newsData.map((n) => n.category))),
    []
  );

  const categories = useMemo(
    () => [
      { code: ALL_CATEGORY_CODE, label: t("feed.category_all") },
      ...categoryValues.map((cat) => ({ code: cat, label: cat })),
    ],
    [t, categoryValues]
  );

  const [selected, setSelected] = useState<string>(ALL_CATEGORY_CODE);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);

  const filteredNews = useMemo(() => {
    if (selected === ALL_CATEGORY_CODE) return newsData;
    return newsData.filter((item) => item.category === selected);
  }, [selected]);

  useEffect(() => {
    const newsId = route.params?.newsId;
    if (!newsId) return;

    const target = newsData.find((n) => n.id === newsId);
    if (target) {
      setActiveNews(target);
    } else {
      // Handle missing news item
      Alert.alert(
        t("error"),
        t("feed.newsNotFound"),
        [
          {
            text: t("ok"),
            onPress: () => {
              navigation.setParams({ newsId: undefined });
            },
          },
        ]
      );
    }
  }, [route.params?.newsId, navigation, t]);

  const handleCloseDetail = () => {
    const origin = route.params?.origin;
    navigation.setParams({ newsId: undefined, origin: undefined });
    setActiveNews(null);
    if (origin === "Home") {
      navigation.navigate("Home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("feed.title")}</Text>
        <Text style={styles.subtitle}>{t("feed.subtitle")}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.code}
              style={[
                styles.chip,
                selected === cat.code && styles.chipActive,
                { borderColor: selected === cat.code ? colors.primary : colors.border },
              ]}
              onPress={() => setSelected(cat.code)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected === cat.code && { color: colors.text },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filteredNews.length === 0 ? (
            <Text style={styles.cardMeta}>{t("error_unknown")}</Text>
          ) : (
            filteredNews.map((news) => (
              <Pressable
                key={news.id}
                onPress={() => setActiveNews(news)}
                style={styles.card}
              >
                {news.image && (
                  <ImageBackground
                    source={news.image}
                    style={styles.cardImage}
                    imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  >
                    <LinearGradient
                      colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.35)"]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.cardImageContent}>
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{news.category}</Text>
                      </View>
                      <Text style={styles.cardTitle}>{news.title}</Text>
                    </View>
                  </ImageBackground>
                )}
                <View style={styles.cardBody}>
                  {!news.image && (
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>{news.category}</Text>
                    </View>
                  )}
                  <Text style={styles.cardSummary}>{news.summary}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.footerMeta}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.mutedText}
                      />
                      <Text style={styles.cardMeta}>
                        {t("feed.time_ago", { time: news.time })}
                      </Text>
                    </View>
                    <View style={styles.footerMeta}>
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={colors.mutedText}
                      />
                      <Text style={styles.cardMeta}>{t("feed.mock_reads")}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!activeNews}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetail}
      >
        <SafeAreaView style={styles.detailSafeArea}>
          {activeNews && (
            <ScrollView contentContainerStyle={styles.detailContainer}>
              <Pressable
                onPress={handleCloseDetail}
                style={styles.closeRow}
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
                <Text style={styles.closeText}>{t("feed.back")}</Text>
              </Pressable>

              {activeNews.image && (
                <ImageBackground
                  source={activeNews.image}
                  style={styles.detailHero}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.05)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>{activeNews.category}</Text>
                  </View>
                  <View style={styles.detailHeroText}>
                    <Text style={styles.detailTitle}>{activeNews.title}</Text>
                    <View style={styles.detailMetaRow}>
                      <Ionicons name="time-outline" size={16} color={colors.text} />
                      <Text style={styles.detailMeta}>
                        {t("feed.time_ago", { time: activeNews.time })}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              )}

              {!activeNews.image && (
                <View style={styles.detailHeader}>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>{activeNews.category}</Text>
                  </View>
                  <Text style={styles.detailTitle}>{activeNews.title}</Text>
                  <View style={styles.detailMetaRow}>
                    <Ionicons name="time-outline" size={16} color={colors.mutedText} />
                    <Text style={styles.detailMeta}>
                      {t("feed.time_ago", { time: activeNews.time })}
                    </Text>
                  </View>
                </View>
              )}

              {(activeNews.body?.length
                ? activeNews.body
                : [activeNews.summary]
              ).map((paragraph, idx) => (
                <Text key={idx} style={styles.detailBody}>
                  {paragraph}
                </Text>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontFamily: typography.bold,
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginBottom: spacing.lg,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: "rgba(15,169,88,0.1)",
  },
  chipText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardImage: {
    height: 160,
  },
  cardImageContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  cardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(209,14,14,0.8)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardSummary: {
    color: colors.text,
    fontFamily: typography.medium,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  cardMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  detailSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  closeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  closeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  detailHero: {
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
  },
  detailHeroText: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    gap: spacing.xs,
  },
  detailBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailBadgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  detailTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: fontSizes.xl,
  },
  detailMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  detailMeta: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  detailHeader: {
    gap: spacing.xs,
  },
  detailBody: {
    color: colors.text,
    fontFamily: typography.medium,
    lineHeight: 24,
  },
});

export default FeedScreen;
