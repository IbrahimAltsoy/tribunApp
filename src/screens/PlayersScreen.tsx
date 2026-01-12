import React, { useCallback, useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Player } from "../services/api";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import { api } from "../services/api";
import { logger } from "../utils/logger";

const PlayersScreen: React.FC = () => {
  const { t } = useTranslation();
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load players from API
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        logger.log('Loading players from API...');
        const response = await api.getPlayers('Mens'); // Load men's team by default

        if (response.success && response.data) {
          logger.log(`Loaded ${response.data.length} players`);
          setPlayersData(response.data);
        } else {
          logger.error('Failed to load players:', response.error);
        }
      } catch (error) {
        logger.error('Error loading players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const renderPlayerCard: ListRenderItem<Player> = useCallback(({ item: p }) => {
    const playerNumber = p.jerseyNumber || p.number || 0;
    const playerBio = p.biography || p.bio || '';
    const playerAge = p.age || (p.birthDate ? Math.floor((new Date().getTime() - new Date(p.birthDate).getTime()) / 31557600000) : undefined);
    const playerHeight = p.height ? `${(p.height / 100).toFixed(2)} m` : '- m';
    const playerFoot = p.preferredFoot || p.foot || '-';
    const playerHometown = p.birthPlace || p.hometown || t("archive.contactUnknown");
    const playerImageSource = p.imageUrl ? { uri: p.imageUrl } : (p.image || require("../assets/footboll/1.jpg"));

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.playerNumber}>#{playerNumber}</Text>
          <Pressable>
            <Ionicons name="star-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <Image
          source={playerImageSource}
          style={styles.playerImage}
        />

        <Text style={styles.playerName}>{p.name}</Text>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{p.position}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label={t("stats.matches")} value={p.matches ?? "-"} />
          <Stat label={t("stats.goals")} value={p.goals ?? "-"} />
          <Stat label={t("stats.assists")} value={p.assists ?? "-"} />
          <Stat
            label={t("stats.rating")}
            value={p.rating ? `${p.rating}/10` : "-"}
          />
        </View>

        <View style={styles.metaGrid}>
          <Meta
            icon="walk"
            text={playerFoot}
          />
          <Meta icon="male" text={playerHeight} />
          <Meta icon="flash" text={playerAge ? `${playerAge} ${t("years")}` : "-"} />
          <Meta icon="map" text={playerHometown} />
        </View>

        {playerBio ? <Text style={styles.bio}>{playerBio}</Text> : null}

        {p.strengths && p.strengths.length > 0 && (
          <>
            <Text style={styles.label}>{t("strengths")}</Text>
            <View style={styles.tagRow}>
              {p.strengths.map((s) => (
                <View style={styles.tag} key={s}>
                  <Ionicons name="checkmark" size={14} color={colors.text} />
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {p.career?.length ? (
          <>
            <Text style={styles.label}>{t("career")}</Text>
            <View style={styles.careerBox}>
              {p.career.map((c, i) => (
                <Text key={`${p.id}-car-${i}`} style={styles.careerText}>
                  • {c}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="heart" size={18} color={colors.text} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="share-social" size={18} color={colors.text} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
    );
  }, [t]);

  const keyExtractor = useCallback((item: typeof players[0]) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <>
      <Text style={styles.screenTitle}>{t("archive.sectionLegends")}</Text>
      <Text style={styles.screenSubtitle}>
        {t("archive.sectionLegendsSubtitle")}
      </Text>
    </>
  ), [t]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={playersData}
        renderItem={renderPlayerCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("noPlayersFound")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Meta = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={14} color={colors.text} />
    <Text style={styles.metaChipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },

  screenTitle: { color: colors.text, fontSize: fontSizes.xl, fontFamily: typography.bold },
  screenSubtitle: { color: colors.mutedText, fontSize: fontSizes.md, marginBottom: spacing.sm },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  playerNumber: { color: colors.text, fontSize: fontSizes.lg, fontFamily: typography.bold },

  playerImage: { width: "100%", height: 230, borderRadius: 14, backgroundColor: "#111" },

  playerName: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontFamily: typography.bold,
    textAlign: "center",
  },
  positionBadge: {
    alignSelf: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  positionText: { color: colors.primary, fontFamily: typography.semiBold },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: fontSizes.lg, color: colors.text, fontFamily: typography.bold },
  statLabel: { fontSize: fontSizes.sm, color: colors.mutedText },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: {
    flexDirection: "row",
    gap: 4,
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaChipText: { color: colors.text, fontSize: fontSizes.sm },

  bio: { color: colors.mutedText, lineHeight: 20 },

  label: { color: colors.text, fontFamily: typography.semiBold, marginTop: spacing.sm },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: { color: colors.text, fontSize: fontSizes.sm },

  careerBox: { gap: 2 },
  careerText: { color: colors.mutedText, fontSize: fontSizes.sm },

  actionRow: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.sm },
  actionBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    fontFamily: typography.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.mutedText,
    fontFamily: typography.medium,
    textAlign: "center",
  },
});

export default PlayersScreen;
