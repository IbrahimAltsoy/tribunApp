import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { userSafetyService, BlockedUserDetailDto } from '../services/userSafetyService';

const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    const result = await userSafetyService.getBlockedUsersWithDetails();
    if (result.success && result.data) {
      setBlockedUsers(result.data);
    }
  }, []);

  useEffect(() => {
    loadBlockedUsers().finally(() => setLoading(false));
  }, [loadBlockedUsers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBlockedUsers();
    setRefreshing(false);
  }, [loadBlockedUsers]);

  const handleUnblock = useCallback((user: BlockedUserDetailDto) => {
    const displayName = user.displayName || user.username;
    Alert.alert(
      'Engeli Kaldır',
      `${displayName} adlı kullanıcının engelini kaldırmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engeli Kaldır',
          style: 'destructive',
          onPress: async () => {
            setUnblockingId(user.blockedUserId);
            const result = await userSafetyService.unblockUser(user.blockedUserId);
            setUnblockingId(null);
            if (result.success) {
              setBlockedUsers(prev => prev.filter(u => u.blockedUserId !== user.blockedUserId));
            } else {
              Alert.alert('Hata', 'Engel kaldırılamadı. Lütfen tekrar deneyin.');
            }
          },
        },
      ]
    );
  }, []);

  const renderItem = ({ item }: { item: BlockedUserDetailDto }) => {
    const displayName = item.displayName || item.username;
    const isUnblocking = unblockingId === item.blockedUserId;

    return (
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={colors.textTertiary} />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
          {item.context && (
            <View style={styles.contextBadge}>
              <Ionicons
                name={item.context === 'Chat' ? 'chatbubble-outline' : 'image-outline'}
                size={11}
                color={colors.textTertiary}
              />
              <Text style={styles.contextText}>
                {item.context === 'Chat' ? 'Sohbet' : 'Fan Moment'}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.unblockButton,
            pressed && styles.unblockButtonPressed,
            isUnblocking && styles.unblockButtonDisabled,
          ]}
          onPress={() => handleUnblock(item)}
          disabled={isUnblocking}
        >
          {isUnblocking ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.unblockButtonText}>Engeli Kaldır</Text>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Engellenen Kullanıcılar</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="shield-checkmark-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Engellenen Kullanıcı Yok</Text>
          <Text style={styles.emptyDescription}>
            Engellediğiniz kullanıcılar burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={item => item.blockedUserId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {blockedUsers.length} kullanıcı engellendi
            </Text>
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.white,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listHeader: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    gap: spacing.md,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.textTertiary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
  },
  username: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  contextText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.textTertiary,
  },
  unblockButton: {
    backgroundColor: colors.error,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unblockButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  unblockButtonDisabled: {
    opacity: 0.5,
  },
  unblockButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.white,
  },
});

export default BlockedUsersScreen;
