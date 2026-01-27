import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import {
  userSafetyService,
  ReportCategory,
  ContentType,
} from '../services/userSafetyService';

const IS_IOS = Platform.OS === 'ios';

interface ReportBlockModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  targetSessionId: string;
  contentType: ContentType;
  contentId: string;
  showBlockOption?: boolean;
  onBlockSuccess?: () => void;
  onReportSuccess?: () => void;
}

type ReportCategoryItem = {
  id: ReportCategory;
  label: string;
  icon: string;
};

const REPORT_CATEGORIES: ReportCategoryItem[] = [
  { id: 'Inappropriate', label: 'Uygunsuz Icerik', icon: 'warning' },
  { id: 'Spam', label: 'Spam', icon: 'mail-unread' },
  { id: 'Harassment', label: 'Taciz', icon: 'person-remove' },
  { id: 'HateSpeech', label: 'Nefret Soylemi', icon: 'megaphone' },
  { id: 'Violence', label: 'Siddet', icon: 'flame' },
  { id: 'Other', label: 'Diger', icon: 'ellipsis-horizontal' },
];

const ReportBlockModal: React.FC<ReportBlockModalProps> = ({
  visible,
  onClose,
  sessionId,
  targetSessionId,
  contentType,
  contentId,
  showBlockOption = true,
  onBlockSuccess,
  onReportSuccess,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'menu' | 'report' | 'block'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setMode('menu');
    setSelectedCategory(null);
    setDescription('');
    onClose();
  };

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      const response = await userSafetyService.blockUser(
        sessionId,
        targetSessionId,
        contentType,
        'Kullanici tarafindan engellendi'
      );

      if (response.success) {
        Alert.alert(
          t('block.success', 'Engellendi'),
          t('block.successMessage', 'Kullanici basariyla engellendi. Artik iceriklerini gormeyeceksiniz.'),
          [{ text: 'Tamam', onPress: handleClose }]
        );
        onBlockSuccess?.();
      } else {
        Alert.alert(
          t('block.error', 'Hata'),
          t('block.errorMessage', 'Engelleme islemi basarisiz oldu. Lutfen tekrar deneyin.')
        );
      }
    } catch (error) {
      Alert.alert(
        t('block.error', 'Hata'),
        t('block.errorMessage', 'Engelleme islemi basarisiz oldu. Lutfen tekrar deneyin.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    if (!selectedCategory) {
      Alert.alert(
        t('report.selectCategory', 'Kategori Secin'),
        t('report.selectCategoryMessage', 'Lutfen bir raporlama kategorisi secin.')
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await userSafetyService.reportContent(
        sessionId,
        contentType,
        contentId,
        selectedCategory,
        description || undefined,
        targetSessionId || undefined
      );

      if (response.success) {
        Alert.alert(
          t('report.success', 'Raporlandi'),
          t('report.successMessage', 'Icerik basariyla raporlandi. Moderasyon ekibimiz inceleyecek.'),
          [{ text: 'Tamam', onPress: handleClose }]
        );
        onReportSuccess?.();
      } else {
        Alert.alert(
          t('report.error', 'Hata'),
          t('report.errorMessage', 'Raporlama islemi basarisiz oldu. Lutfen tekrar deneyin.')
        );
      }
    } catch (error) {
      Alert.alert(
        t('report.error', 'Hata'),
        t('report.errorMessage', 'Raporlama islemi basarisiz oldu. Lutfen tekrar deneyin.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>{t('safety.title', 'Ne yapmak istiyorsunuz?')}</Text>

      <Pressable
        style={styles.menuItem}
        onPress={() => setMode('report')}
      >
        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
          <Ionicons name="flag" size={24} color="#ef4444" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuItemTitle}>{t('safety.report', 'Icerigi Raporla')}</Text>
          <Text style={styles.menuItemDesc}>
            {t('safety.reportDesc', 'Uygunsuz icerigi moderasyona bildir')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>

      {showBlockOption && (
        <Pressable
          style={styles.menuItem}
          onPress={() => setMode('block')}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
            <Ionicons name="ban" size={24} color="#f97316" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuItemTitle}>{t('safety.block', 'Kullaniciyi Engelle')}</Text>
            <Text style={styles.menuItemDesc}>
              {t('safety.blockDesc', 'Bu kullanicinin iceriklerini gorme')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      )}

      <Pressable style={styles.cancelButton} onPress={handleClose}>
        <Text style={styles.cancelText}>{t('common.cancel', 'Iptal')}</Text>
      </Pressable>
    </View>
  );

  const renderReport = () => (
    <View style={styles.reportContainer}>
      <View style={styles.reportHeader}>
        <Pressable onPress={() => setMode('menu')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{t('report.title', 'Icerigi Raporla')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        {t('report.selectReason', 'Raporlama sebebini secin:')}
      </Text>

      <View style={styles.categoriesContainer}>
        {REPORT_CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={
                selectedCategory === category.id ? colors.primary : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.label}
            </Text>
            {selectedCategory === category.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </View>

      <Text style={styles.optionalLabel}>
        {t('report.additionalInfo', 'Ek bilgi (istege bagli):')}
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder={t('report.placeholder', 'Detay ekleyin...')}
        placeholderTextColor={colors.textTertiary}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={500}
      />

      <Pressable
        style={[styles.submitButton, !selectedCategory && styles.submitButtonDisabled]}
        onPress={handleReport}
        disabled={!selectedCategory || isLoading}
      >
        <LinearGradient
          colors={selectedCategory ? ['#ef4444', '#dc2626'] : ['#666', '#666']}
          style={styles.submitGradient}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="flag" size={20} color={colors.white} />
              <Text style={styles.submitText}>{t('report.submit', 'Raporla')}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderBlock = () => (
    <View style={styles.blockContainer}>
      <View style={styles.reportHeader}>
        <Pressable onPress={() => setMode('menu')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{t('block.title', 'Kullaniciyi Engelle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.blockWarning}>
        <Ionicons name="information-circle" size={24} color="#f97316" />
        <Text style={styles.blockWarningText}>
          {t(
            'block.warning',
            'Bu kullaniciyi engellediginizde, onun gonderdigini icerikleri artik gormeyeceksiniz. Bu islem geri alinabilir.'
          )}
        </Text>
      </View>

      <View style={styles.blockActions}>
        <Pressable style={styles.cancelBlockButton} onPress={handleClose}>
          <Text style={styles.cancelBlockText}>{t('common.cancel', 'Iptal')}</Text>
        </Pressable>

        <Pressable
          style={styles.confirmBlockButton}
          onPress={handleBlock}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            style={styles.confirmBlockGradient}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="ban" size={20} color={colors.white} />
                <Text style={styles.confirmBlockText}>{t('block.confirm', 'Engelle')}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <BlurView intensity={IS_IOS ? 30 : 20} tint="dark" style={styles.blur}>
          <View style={styles.container}>
            <View style={styles.handle} />
            {mode === 'menu' && renderMenu()}
            {mode === 'report' && renderReport()}
            {mode === 'block' && renderBlock()}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blur: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: 'rgba(19, 30, 19, 0.95)',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.glassStroke,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  // Menu styles
  menuContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.md,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
    color: colors.white,
  },
  menuItemDesc: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },

  // Report styles
  reportContainer: {
    padding: spacing.lg,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
  },
  categoryText: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  optionalLabel: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.white,
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  submitButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  submitText: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.white,
  },

  // Block styles
  blockContainer: {
    padding: spacing.lg,
  },
  blockWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  blockWarningText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  blockActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBlockButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.lg,
  },
  cancelBlockText: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  confirmBlockButton: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  confirmBlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  confirmBlockText: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.white,
  },
});

export default ReportBlockModal;
