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
import { BottomTabParamList } from "../navigation/BottomTabs";
import { newsService } from "../services/newsService";
import type { NewsDto, NewsCategoryDto } from "../types/news";

const ALL_CATEGORY_CODE = "__all__";

const FeedScreen: React.FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const route = useRoute<RouteProp<BottomTabParamList, "Feed">>();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<NewsCategoryDto[]>([]);
  const [selected, setSelected] = useState<string>(ALL_CATEGORY_CODE);
  const [news, setNews] = useState<NewsDto[]>([]);
  const [activeNews, setActiveNews] = useState<NewsDto | null>(null);

  // Load categories from backen
  useEffect(() => {
    const loadCategories = async () => {
      const response = await newsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    };
    loadCategories();
  }, []);

  // Load news based on selected category
  useEffect(() => {
    const loadNews = async () => {
      if (selected === ALL_CATEGORY_CODE) {
        const response = await newsService.getNews(1, 100);
        if (response.success && response.data) {
          setNews(response.data.items);
        }
      } else {
        const response = await newsService.getNewsByCategory(selected, 1, 100);
        if (response.success && response.data) {
          setNews(response.data.items);
        }
      }
    };
    loadNews();
  }, [selected]);

  const categoryOptions = useMemo(() => {
    // Remove duplicates by slug (in case database has duplicates)
    const uniqueCategories = categories.reduce((acc, current) => {
      const exists = acc.find(item => item.slug === current.slug);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as NewsCategoryDto[]);

    // Sort by sortOrder
    const sorted = uniqueCategories.sort((a, b) => a.sortOrder - b.sortOrder);

    return [
      {
        id: ALL_CATEGORY_CODE,
        slug: ALL_CATEGORY_CODE,
        name: t("feed.category_all"),
        sortOrder: 0,
      },
      ...sorted,
    ];
  }, [t, categories]);

  // Load news detail when newsId changes
  useEffect(() => {
    const newsId = route.params?.newsId;
    if (!newsId) return;

    const loadNewsDetail = async () => {
      const response = await newsService.getNewsById(newsId);
      if (response.success && response.data) {
        setActiveNews(response.data);
      } else {
        // Handle missing news item
        Alert.alert(t("error"), t("feed.newsNotFound"), [
          {
            text: t("ok"),
            onPress: () => {
              navigation.setParams({ newsId: undefined });
            },
          },
        ]);
      }
    };

    loadNewsDetail();
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
          {categoryOptions.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                selected === cat.slug && styles.chipActive,
                {
                  borderColor:
                    selected === cat.slug ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelected(cat.slug)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected === cat.slug && { color: colors.text },
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {news.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="newspaper-outline"
                size={48}
                color={colors.mutedText}
              />
              <Text style={styles.emptyStateText}>
                {selected === ALL_CATEGORY_CODE
                  ? t("feed.no_news")
                  : t("feed.no_news_in_category")}
              </Text>
            </View>
          ) : (
            news.map((newsItem) => {
              // Calculate time ago
              const getTimeAgo = () => {
                const date = new Date(
                  newsItem.publishedAt || newsItem.createdAt
                );
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                if (diffMins < 60) return `${diffMins} ${t("feed.timeUnits.minutes")}`;
                if (diffHours < 24) return `${diffHours} ${t("feed.timeUnits.hours")}`;
                return `${diffDays} ${t("feed.timeUnits.days")}`;
              };

              return (
                <Pressable
                  key={newsItem.id}
                  onPress={() => setActiveNews(newsItem)}
                  style={styles.card}
                >
                  {(newsItem.imageUrl || newsItem.thumbnailUrl) && (
                    <ImageBackground
                      source={{
                        uri: newsItem.thumbnailUrl || newsItem.imageUrl,
                      }}
                      style={styles.cardImage}
                      imageStyle={{
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                    >
                      <LinearGradient
                        colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.35)"]}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.cardImageContent}>
                        <View style={styles.cardBadge}>
                          <Text style={styles.cardBadgeText}>
                            {newsItem.category?.name || t("feed.defaultCategory")}
                          </Text>
                        </View>
                        <Text style={styles.cardTitle}>{newsItem.title}</Text>
                      </View>
                    </ImageBackground>
                  )}
                  <View style={styles.cardBody}>
                    {!newsItem.imageUrl && !newsItem.thumbnailUrl && (
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>
                          {newsItem.category?.name || t("feed.defaultCategory")}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.cardSummary}>{newsItem.summary}</Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.footerMeta}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.mutedText}
                        />
                        <Text style={styles.cardMeta}>
                          {t("feed.time_ago", { time: getTimeAgo() })}
                        </Text>
                      </View>
                      <View style={styles.footerMeta}>
                        <Ionicons
                          name="eye-outline"
                          size={16}
                          color={colors.mutedText}
                        />
                        <Text style={styles.cardMeta}>
                          {newsItem.viewCount} {t("feed.reads")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
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

              {(activeNews.imageUrl || activeNews.thumbnailUrl) && (
                <ImageBackground
                  source={{
                    uri: activeNews.imageUrl || activeNews.thumbnailUrl,
                  }}
                  style={styles.detailHero}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.05)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>
                      {activeNews.category?.name || t("feed.defaultCategory")}
                    </Text>
                  </View>
                  <View style={styles.detailHeroText}>
                    <Text style={styles.detailTitle}>{activeNews.title}</Text>
                    <View style={styles.detailMetaRow}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.text}
                      />
                      <Text style={styles.detailMeta}>
                        {t("feed.time_ago", {
                          time: (() => {
                            const date = new Date(
                              activeNews.publishedAt || activeNews.createdAt
                            );
                            const now = new Date();
                            const diffMs = now.getTime() - date.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            const diffDays = Math.floor(diffHours / 24);

                            if (diffMins < 60) return `${diffMins} ${t("feed.timeUnits.minutes")}`;
                            if (diffHours < 24) return `${diffHours} ${t("feed.timeUnits.hours")}`;
                            return `${diffDays} ${t("feed.timeUnits.days")}`;
                          })(),
                        })}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              )}

              {!activeNews.imageUrl && !activeNews.thumbnailUrl && (
                <View style={styles.detailHeader}>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>
                      {activeNews.category?.name || t("feed.defaultCategory")}
                    </Text>
                  </View>
                  <Text style={styles.detailTitle}>{activeNews.title}</Text>
                  <View style={styles.detailMetaRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.mutedText}
                    />
                    <Text style={styles.detailMeta}>
                      {t("feed.time_ago", {
                        time: (() => {
                          const date = new Date(
                            activeNews.publishedAt || activeNews.createdAt
                          );
                          const now = new Date();
                          const diffMs = now.getTime() - date.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMins / 60);
                          const diffDays = Math.floor(diffHours / 24);

                          if (diffMins < 60) return `${diffMins} dakika`;
                          if (diffHours < 24) return `${diffHours} saat`;
                          return `${diffDays} gün`;
                        })(),
                      })}
                    </Text>
                  </View>
                </View>
              )}

              {activeNews.content ? (
                <Text style={styles.detailBody}>{activeNews.content}</Text>
              ) : (
                <Text style={styles.detailBody}>{activeNews.summary}</Text>
              )}
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyStateText: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.md,
    textAlign: "center",
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
