import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Pressable,
  Linking,
} from "react-native";
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
  const thumb =
    event.thumb ||
    (event.thumbUrl ? { uri: event.thumbUrl } : require("../../assets/footboll/1.jpg"));
  const clipUrl =
    event.clip?.embedUrl ||
    event.clip?.url ||
    event.videoUrl;

  const platformIcon = (() => {
    switch (event.clip?.platform) {
      case "youtube":
      case "bein":
      case "trt":
        return "logo-youtube";
      case "x":
        return "logo-twitter";
      case "instagram":
        return "logo-instagram";
      default:
        return "play-outline";
    }
  })();

  const platformLabel = (() => {
    switch (event.clip?.platform) {
      case "bein":
        return "beIN SPORTS embed";
      case "trt":
        return "TRT Spor embed";
      case "youtube":
        return "YouTube embed";
      case "x":
        return "X (Twitter) embed";
      case "instagram":
        return "Instagram embed";
      default:
        return "Harici kaynak";
    }
  })();

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

      <Pressable
        onPress={() => {
          if (clipUrl) {
            Linking.openURL(clipUrl);
          }
        }}
        disabled={!clipUrl}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <ImageBackground
          source={thumb}
          style={styles.videoBox}
          imageStyle={styles.videoImage}
        >
          <View style={styles.sourceRow}>
            <View style={styles.sourcePill}>
              <Ionicons name={platformIcon} size={14} color={colors.text} />
              <Text style={styles.sourceText}>
                {event.clip?.provider || "Harici video"}
              </Text>
            </View>
            <Text style={styles.platformLabel}>{platformLabel}</Text>
          </View>

          <View style={{ gap: spacing.xs }}>
            <Text style={styles.clipTitle}>
              Amedspor vs {liveMatch.away} • {event.minute}'
            </Text>
            <Text style={styles.clipNote} numberOfLines={2}>
              {event.clip?.note || "Video ilgili kaynaktan embed acilacak."}
            </Text>
          </View>

          <Text style={styles.videoLink} numberOfLines={1}>
            {clipUrl || "Video baglantisi eklenmedi"}
          </Text>
        </ImageBackground>
      </Pressable>
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
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceText: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.xs,
  },
  platformLabel: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  clipTitle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  clipNote: {
    color: colors.mutedText,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    lineHeight: 16,
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
