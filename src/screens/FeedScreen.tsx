import React, { useMemo, useState } from "react";
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
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { newsData, fanMoments } from "../data/mockData";

const categories = ["Tümü", ...Array.from(new Set(newsData.map((n) => n.category)))];

const FeedScreen: React.FC = () => {
  const [selected, setSelected] = useState<string>("Tümü");

  const filteredNews = useMemo(() => {
    if (selected === "Tümü") return newsData;
    return newsData.filter((item) => item.category === selected);
  }, [selected]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Haberler</Text>
        <Text style={styles.subtitle}>
          Mock verilerle güncel Amedspor gündemi ve tribün duyuruları
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.chip,
                selected === cat && styles.chipActive,
                { borderColor: selected === cat ? colors.primary : colors.border },
              ]}
              onPress={() => setSelected(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected === cat && { color: colors.text },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filteredNews.map((news) => (
            <View key={news.id} style={styles.card}>
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
              <View style={styles.cardBody}>
                <Text style={styles.cardSummary}>{news.summary}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.footerMeta}>
                    <Ionicons name="time-outline" size={16} color={colors.mutedText} />
                    <Text style={styles.cardMeta}>{news.time} önce</Text>
                  </View>
                  <View style={styles.footerMeta}>
                    <Ionicons name="eye-outline" size={16} color={colors.mutedText} />
                    <Text style={styles.cardMeta}>Mock okuma</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tribün Anları</Text>
        <Text style={styles.sectionSubtitle}>
          Taraftarların bulunduğu yerden canlı paylaşımlar
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.momentsRow}
        >
          {fanMoments.map((moment) => (
            <View key={moment.id} style={styles.momentCard}>
              <LinearGradient
                colors={["rgba(15,169,88,0.15)", "rgba(0,0,0,0.4)"]}
                style={styles.momentMedia}
              >
                {moment.image && (
                  <ImageBackground
                    source={moment.image}
                    style={StyleSheet.absoluteFill}
                    imageStyle={{ borderRadius: 14 }}
                  />
                )}
                <View style={styles.momentBadge}>
                  <Text style={styles.momentBadgeText}>{moment.source}</Text>
                </View>
              </LinearGradient>
              <View style={styles.momentBody}>
                <View style={styles.momentHeader}>
                  <Text style={styles.momentUser}>{moment.user}</Text>
                  <Text style={styles.momentTime}>{moment.time} önce</Text>
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                <View style={styles.momentLocationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.mutedText} />
                  <Text style={styles.momentLocation}>{moment.location}</Text>
                </View>
              </View>
            </View>
          ))}
          <Pressable style={styles.momentCTA}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
            <Text style={styles.momentCTAText}>Sen de paylaş</Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
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
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.lg,
    marginTop: spacing.xl,
  },
  sectionSubtitle: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    marginBottom: spacing.md,
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
  momentsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  momentCard: {
    width: 240,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  momentMedia: {
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  momentBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  momentBadgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  momentBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  momentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  momentUser: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
  momentTime: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  momentCaption: {
    color: colors.text,
    fontFamily: typography.medium,
  },
  momentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  momentLocation: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
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
  momentCTAText: {
    color: colors.text,
    fontFamily: typography.semiBold,
  },
});

export default FeedScreen;
