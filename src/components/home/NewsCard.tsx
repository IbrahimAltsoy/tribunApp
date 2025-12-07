import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { newsData } from "../../data/mockData";

type Props = {
  item: (typeof newsData)[0];
  onPress?: (id: string) => void;
};

const NewsCard: React.FC<Props> = ({ item, onPress }) => {
  const summary =
    item.summary.length > 50
      ? `${item.summary.slice(0, 50).trimEnd()}...`
      : item.summary;

  const body = (
    <View style={styles.newsContent}>
      <View style={styles.newsPill}>
        <Text style={styles.newsPillText}>{item.category}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{summary}</Text>
      <Text style={styles.newsMeta}>{item.time} once</Text>
    </View>
  );

  if (item.image) {
    return (
      <Pressable
        style={styles.newsCard}
        onPress={() => onPress?.(item.id)}
        accessibilityRole="button"
      >
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
    <Pressable
      style={[styles.newsCard, styles.newsCardPlain]}
      onPress={() => onPress?.(item.id)}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={["rgba(15,169,88,0.15)", "rgba(209,14,14,0.08)"]}
        style={[styles.newsImage, { borderRadius: 16 }]}
      >
        {body}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
});

export default NewsCard;
