import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { fanMomentService } from '../../services/fanMomentService';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { fontSizes, typography } from '../../theme/typography';
import type { FanMomentDto } from '../../types/fanMoment';

const IS_IOS = Platform.OS === 'ios';
const PAGE_SIZE = 12;

type Tab = 'shared' | 'liked';

type PublicProfile = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
};

type Props = {
  visible: boolean;
  userId: string | null;
  username: string;
  initialAvatarUrl?: string;
  onClose: () => void;
};

const UserProfileModal: React.FC<Props> = ({ visible, userId, username, initialAvatarUrl, onClose }) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('shared');
  const [loading, setLoading] = useState(false);

  // Shared moments
  const [sharedMoments, setSharedMoments] = useState<FanMomentDto[]>([]);
  const [sharedPage, setSharedPage] = useState(1);
  const [sharedHasMore, setSharedHasMore] = useState(true);
  const [sharedTotal, setSharedTotal] = useState(0);
  const [loadingMoreShared, setLoadingMoreShared] = useState(false);

  // Liked moments
  const [likedMoments, setLikedMoments] = useState<FanMomentDto[]>([]);
  const [likedPage, setLikedPage] = useState(1);
  const [likedHasMore, setLikedHasMore] = useState(true);
  const [likedTotal, setLikedTotal] = useState(0);
  const [loadingMoreLiked, setLoadingMoreLiked] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    const res = await fanMomentService.getUserPublicProfile(uid);
    if (res.success && res.data) setProfile(res.data as PublicProfile);
  }, []);

  const loadShared = useCallback(async (uid: string, pageNum: number) => {
    if (pageNum > 1) setLoadingMoreShared(true);
    const res = await fanMomentService.getUserMoments(uid, pageNum, PAGE_SIZE);
    if (res.success && res.data) {
      setSharedMoments(prev => pageNum === 1 ? res.data! : [...prev, ...res.data!]);
      const total = res.totalCount ?? res.data.length;
      setSharedTotal(total);
      setSharedHasMore(pageNum * PAGE_SIZE < total);
    }
    setLoadingMoreShared(false);
  }, []);

  const loadLiked = useCallback(async (uid: string, pageNum: number) => {
    if (pageNum > 1) setLoadingMoreLiked(true);
    const res = await fanMomentService.getUserLikedMoments(uid, pageNum, PAGE_SIZE);
    if (res.success && res.data) {
      setLikedMoments(prev => pageNum === 1 ? res.data! : [...prev, ...res.data!]);
      const total = res.totalCount ?? res.data.length;
      setLikedTotal(total);
      setLikedHasMore(pageNum * PAGE_SIZE < total);
    }
    setLoadingMoreLiked(false);
  }, []);

  useEffect(() => {
    if (visible && userId) {
      setProfile(null);
      setSharedMoments([]);
      setLikedMoments([]);
      setSharedPage(1);
      setLikedPage(1);
      setSharedHasMore(true);
      setLikedHasMore(true);
      setActiveTab('shared');
      setLoading(true);
      Promise.all([
        loadProfile(userId),
        loadShared(userId, 1),
        loadLiked(userId, 1),
      ]).finally(() => setLoading(false));
    }
  }, [visible, userId]);

  const handleLoadMore = useCallback(() => {
    if (!userId) return;
    if (activeTab === 'shared' && !loadingMoreShared && sharedHasMore) {
      const next = sharedPage + 1;
      setSharedPage(next);
      loadShared(userId, next);
    } else if (activeTab === 'liked' && !loadingMoreLiked && likedHasMore) {
      const next = likedPage + 1;
      setLikedPage(next);
      loadLiked(userId, next);
    }
  }, [activeTab, loadingMoreShared, sharedHasMore, sharedPage, loadingMoreLiked, likedHasMore, likedPage, userId, loadShared, loadLiked]);

  const currentData = activeTab === 'shared' ? sharedMoments : likedMoments;
  const isLoadingMore = activeTab === 'shared' ? loadingMoreShared : loadingMoreLiked;
  const joinYear = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  const renderItem = useCallback(({ item }: { item: FanMomentDto }) => (
    <View style={styles.gridItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={[styles.gridImage, styles.gridPlaceholder]}>
          <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.gridOverlay}>
        <View style={styles.gridLikeRow}>
          <Ionicons name="heart" size={12} color={colors.white} />
          <Text style={styles.gridLikeCount}>{item.likeCount}</Text>
        </View>
      </View>
    </View>
  ), []);

  const ListHeader = (
    <View style={styles.profileSection}>
      {/* Avatar */}
      <LinearGradient
        colors={[colors.primary, colors.accent, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarRing}
      >
        <View style={styles.avatarInner}>
          {(profile?.avatarUrl ?? initialAvatarUrl) ? (
            <Image source={{ uri: profile?.avatarUrl ?? initialAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={36} color={colors.textSecondary} />
          )}
        </View>
      </LinearGradient>

      {/* Name + username */}
      {profile?.displayName ? (
        <Text style={styles.displayName}>{profile.displayName}</Text>
      ) : null}
      <Text style={styles.username}>@{profile?.username ?? username}</Text>

      {/* Bio */}
      {profile?.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : null}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sharedTotal}</Text>
          <Text style={styles.statLabel}>Paylaşım</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={styles.statValue}>{likedTotal}</Text>
          <Text style={styles.statLabel}>Beğeni</Text>
        </View>
        {joinYear ? (
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>{joinYear}</Text>
            <Text style={styles.statLabel}>Katılım</Text>
          </View>
        ) : null}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
          onPress={() => setActiveTab('shared')}
        >
          <LinearGradient
            colors={activeTab === 'shared' ? [colors.primary, colors.accent] : ['transparent', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabGradient}
          >
            <Ionicons
              name="grid-outline"
              size={14}
              color={activeTab === 'shared' ? colors.white : colors.textTertiary}
            />
            <Text style={[styles.tabText, activeTab === 'shared' && styles.tabTextActive]}>
              Paylaşımlar
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          onPress={() => setActiveTab('liked')}
        >
          <LinearGradient
            colors={activeTab === 'liked' ? [colors.primary, colors.accent] : ['transparent', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabGradient}
          >
            <Ionicons
              name="heart-outline"
              size={14}
              color={activeTab === 'liked' ? colors.white : colors.textTertiary}
            />
            <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>
              Beğendikleri
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  const ListEmpty = !loading ? (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === 'shared' ? 'camera-outline' : 'heart-outline'}
        size={40}
        color={colors.textTertiary}
      />
      <Text style={styles.emptyText}>
        {activeTab === 'shared' ? 'Henüz paylaşım yok' : 'Henüz beğenilen moment yok'}
      </Text>
    </View>
  ) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header bar */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(232,17,26,0.12)', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
              <BlurView intensity={IS_IOS ? 20 : 15} tint="dark" style={styles.closeBlur}>
                <Ionicons name="close" size={20} color={colors.white} />
              </BlurView>
            </Pressable>
            <Text style={styles.headerTitle}>Profil</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            key={activeTab}
            data={currentData}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
            renderItem={renderItem}
          />
        )}
      </View>
    </Modal>
  );
};

const GRID_GAP = spacing.xs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingBottom: spacing.md,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.md,
    letterSpacing: 0.5,
  },
  closeButton: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  closeBlur: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },

  // Profile section
  profileSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.card,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  displayName: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
    textAlign: 'center',
  },
  username: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  bio: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: fontSizes.lg,
  },
  statLabel: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    overflow: 'hidden',
  },
  tabActive: {},
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabText: {
    color: colors.textTertiary,
    fontFamily: typography.semiBold,
    fontSize: fontSizes.sm,
  },
  tabTextActive: {
    color: colors.white,
  },

  // Grid
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  columnWrapper: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  gridLikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridLikeCount: {
    color: colors.white,
    fontFamily: typography.semiBold,
    fontSize: 10,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textTertiary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default UserProfileModal;
