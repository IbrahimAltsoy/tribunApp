import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontSizes, typography } from "../../theme/typography";
import { liveMatch } from "../../data/mockData";

const LiveTicker: React.FC = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToAlignment="start"
    >
      {liveMatch.events.map((event) => (
        <LiveEventCard key={event.id} event={event} />
      ))}
    </ScrollView>
  );
};

const LiveEventCard = ({ event }: { event: (typeof liveMatch.events)[0] }) => {
  const thumb = event.thumb || require("../../assets/footboll/1.jpg");
  const videoUrl =
    event.videoUrl ||
    "https://www.youtube.com/watch?v=0UIB9Y4OFPs&list=RDvx2u5uUu3DE&index=27";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.badge,
            event.type === "goal" && styles.badgeGoal,
            event.type === "card" && styles.badgeCard,
          ]}
        >
          <Ionicons
            name={
              event.type === "goal"
                ? "football-outline"
                : event.type === "card"
                  ? "warning-outline"
                  : "sparkles-outline"
            }
            size={14}
            color={colors.text}
          />
          <Text style={styles.badgeText}>{event.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.minute}>{event.minute}'</Text>
      </View>

      <Text style={styles.caption}>
        {event.player}: {event.detail}
      </Text>

      <ImageBackground
        source={thumb}
        style={styles.videoBox}
        imageStyle={styles.videoImage}
      >
        <View style={styles.playCircle}>
          <Ionicons name="play" size={16} color={colors.text} />
        </View>
        <View style={styles.videoMetaRow}>
          <Text style={styles.videoMeta}>Amedspor vs {liveMatch.away}</Text>
          <Text style={styles.videoMeta}>Dakika {event.minute}</Text>
        </View>
        <Text style={styles.videoLink} numberOfLines={1}>
          {
            "https://www.youtube.com/watch?v=0UIB9Y4OFPs&list=RDvx2u5uUu3DE&index=27"
          }
        </Text>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    width: 300,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeGoal: {
    backgroundColor: "rgba(15,169,88,0.15)",
    borderColor: "rgba(15,169,88,0.4)",
  },
  badgeCard: {
    backgroundColor: "rgba(209,14,14,0.12)",
    borderColor: "rgba(209,14,14,0.4)",
  },
  badgeText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  minute: {
    color: colors.text,
    fontFamily: typography.bold,
  },
  caption: {
    color: colors.text,
    fontFamily: typography.semiBold,
    lineHeight: 20,
  },
  videoBox: {
    height: 170,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  videoImage: {
    borderRadius: 14,
  },
  playCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  videoMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  videoMeta: {
    color: colors.mutedText,
    fontFamily: typography.medium,
  },
  videoLink: {
    color: colors.text,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default LiveTicker;
