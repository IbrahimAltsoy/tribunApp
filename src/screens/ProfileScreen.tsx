import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { fanMomentService } from "../services/fanMomentService";
import { mediaService } from "../services/mediaService";
import { colors } from "../theme/colors";
import { spacing, radii } from "../theme/spacing";
import { fontSizes, typography } from "../theme/typography";
import type { FanMomentDto } from "../types/fanMoment";
import MomentDetailModal from "../components/home/MomentDetailModal";
import type { ProfileStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const { width } = Dimensions.get("window");
const GRID_COLS = 3;
const ITEM_SIZE = (width - spacing.md * 2 - spacing.xs * (GRID_COLS - 1)) / GRID_COLS;

type Tab = "mine" | "liked";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { authState, user, logout } = useAuth();
  const isAuthenticated = authState === "authenticated";

  const [activeTab, setActiveTab] = useState<Tab>("mine");
  const [myMoments, setMyMoments] = useState<FanMomentDto[]>([]);
  const [likedMoments, setLikedMoments] = useState<FanMomentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<FanMomentDto | null>(null);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    const raw = user?.avatarUrl;
    if (!raw) { setAvatarDisplayUrl(null); return; }
    // objectName ise signed URL al, tam URL ise objectName'i çıkar
    const objectName = raw.startsWith("http")
      ? raw.replace(/^https?:\/\/[^/]+\/[^/]+\//, "")
      : raw;
    mediaService.getSignedUrl(objectName).then((r) => {
      if (r.success && r.url) setAvatarDisplayUrl(r.url);
    });
  }, [user?.avatarUrl]);

  const loadMoments = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const [myRes, likedRes] = await Promise.all([
      fanMomentService.getMyMoments(1, 60),
      fanMomentService.getLikedMoments(1, 60),
    ]);
    if (myRes.success) setMyMoments(myRes.data ?? []);
    if (likedRes.success) setLikedMoments(likedRes.data ?? []);
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMoments();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["rgba(232,17,26,0.15)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.guestContainer}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.guestIconBg}
          >
            <Ionicons name="person" size={48} color={colors.white} />
          </LinearGradient>
          <Text style={styles.guestTitle}>Profilinize Giriş Yapın</Text>
          <Text style={styles.guestSubtitle}>
            Anılarınızı ve beğendiklerinizi görmek için giriş yapın.
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => (navigation as any).navigate("Auth")}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user?.displayName || user?.username || "Kullanıcı";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentMoments = activeTab === "mine" ? myMoments : likedMoments;

  const renderMomentItem = ({ item }: { item: FanMomentDto }) => (
    <Pressable
      style={styles.gridItem}
      onPress={() => setSelectedMoment(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={[styles.gridImage, styles.gridPlaceholder]}>
          <Ionicons name="image-outline" size={24} color={colors.textTertiary} />
        </View>
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gridOverlay}
      >
        <View style={styles.gridStats}>
          <Ionicons name="heart" size={10} color={colors.accent} />
          <Text style={styles.gridStatsText}>{item.likeCount}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["rgba(232,17,26,0.12)", "transparent"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profil</Text>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <FlatList
        data={currentMoments}
        keyExtractor={(item) => item.id}
        numColumns={GRID_COLS}
        renderItem={renderMomentItem}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Avatar & Info */}
            <View style={styles.profileSection}>
              {/* Avatar with GS gradient ring */}
              <LinearGradient
                colors={[colors.primary, colors.accent, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  {avatarDisplayUrl ? (
                    <Image source={{ uri: avatarDisplayUrl }} style={styles.avatar} />
                  ) : (
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                </View>
              </LinearGradient>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
              {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

              {/* Edit Profile Button */}
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="pencil-outline" size={14} color={colors.accent} />
                <Text style={styles.editButtonText}>Profili Düzenle</Text>
              </Pressable>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{myMoments.length}</Text>
                  <Text style={styles.statLabel}>Anı</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{likedMoments.length}</Text>
                  <Text style={styles.statLabel}>Beğeni</Text>
                </View>
              </View>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tabButton, activeTab === "mine" && styles.tabButtonActive]}
                onPress={() => setActiveTab("mine")}
              >
                <Ionicons
                  name="grid-outline"
                  size={20}
                  color={activeTab === "mine" ? colors.primary : colors.tabInactive}
                />
                <Text style={[styles.tabLabel, activeTab === "mine" && styles.tabLabelActive]}>
                  Anılarım
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabButton, activeTab === "liked" && styles.tabButtonActive]}
                onPress={() => setActiveTab("liked")}
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={activeTab === "liked" ? colors.primary : colors.tabInactive}
                />
                <Text style={[styles.tabLabel, activeTab === "liked" && styles.tabLabelActive]}>
                  Beğendiklerim
                </Text>
              </Pressable>
            </View>

            {loading && (
              <ActivityIndicator
                style={{ marginVertical: spacing.xl }}
                color={colors.primary}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === "mine" ? "camera-outline" : "heart-outline"}
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                {activeTab === "mine"
                  ? "Henüz bir anı paylaşmadınız."
                  : "Henüz beğenilen anı yok."}
              </Text>
            </View>
          ) : null
        }
        columnWrapperStyle={currentMoments.length > 0 ? styles.gridRow : undefined}
      />

      {selectedMoment && (
        <MomentDetailModal
          moment={selectedMoment}
          visible={true}
          onClose={() => setSelectedMoment(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },

  // Guest
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  guestIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  guestTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    width: "80%",
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  loginButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
  },

  // Profile section
  profileSection: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatarRing: {
    width: 98,
    height: 98,
    borderRadius: 49,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: typography.bold,
    color: colors.white,
  },
  displayName: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: 2,
  },
  username: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bio: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  editButtonText: {
    color: colors.accent,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.tabInactive,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },

  // Grid
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  gridRow: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElevated,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 4,
  },
  gridStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  gridStatsText: {
    fontSize: 9,
    fontFamily: typography.semiBold,
    color: colors.white,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textTertiary,
    textAlign: "center",
  },
});

export default ProfileScreen;
