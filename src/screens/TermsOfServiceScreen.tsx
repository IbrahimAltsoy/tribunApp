import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';

type Props = {
  onClose?: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
};

const TermsOfServiceScreen: React.FC<Props> = ({
  onClose,
  showAcceptButton = false,
  onAccept,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>
          {t('terms.lastUpdated', { date: '08 Ocak 2026' })}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Hizmet Kapsamı</Text>
          <Text style={styles.paragraph}>
            Amedspor Tribün uygulaması, Amedspor taraftarlarının maç skorlarını takip edebileceği,
            taraftar topluluğuyla etkileşime geçebileceği, haber ve güncellemeleri alabileceği
            bir mobil platformdur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Kullanıcı Yükümlülükleri</Text>
          <Text style={styles.paragraph}>
            • Doğru ve güncel bilgiler sağlamak{'\n'}
            • Diğer kullanıcılara saygılı davranmak{'\n'}
            • Yasalara ve topluluğa zarar verecek içerik paylaşmamak{'\n'}
            • Fikri mülkiyet haklarına saygı göstermek
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. İçerik Politikası</Text>
          <Text style={styles.paragraph}>
            Kullanıcılar tarafından paylaşılan içerikler (fotoğraflar, yorumlar, anılar) kullanıcının
            sorumluluğundadır. Platform, yasalara aykırı, nefret söylemi içeren veya diğer kullanıcıları
            rahatsız eden içerikleri kaldırma hakkını saklı tutar.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Fikri Mülkiyet</Text>
          <Text style={styles.paragraph}>
            Uygulamadaki tüm tasarım, logo, içerik ve kodlar telif hakkı ile korunmaktadır.
            Kullanıcılar, paylaştıkları içeriklerin kullanım haklarını platforma lisanslamayı kabul ederler.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Sorumluluk Reddi</Text>
          <Text style={styles.paragraph}>
            Platform "olduğu gibi" sunulmaktadır. Hizmetin kesintisiz veya hatasız olacağına dair
            garanti verilmez. Kullanıcılar uygulamayı kendi risk ve sorumluluklarında kullanır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Hesap Askıya Alma</Text>
          <Text style={styles.paragraph}>
            Platform yönetimi, kullanım koşullarını ihlal eden hesapları uyarı vermeksizin
            askıya alma veya sonlandırma hakkını saklı tutar.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Değişiklikler</Text>
          <Text style={styles.paragraph}>
            Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler kullanıcılara
            bildirilecektir. Güncellemelerden sonra uygulamayı kullanmaya devam etmek, yeni koşulları
            kabul ettiğiniz anlamına gelir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. İletişim</Text>
          <Text style={styles.paragraph}>
            Sorularınız için:{'\n'}
            E-posta: destek@amedspor.com{'\n'}
            Web: www.amedspor.com
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Amedspor Tribün. Tüm hakları saklıdır.
          </Text>
        </View>
      </ScrollView>

      {/* Accept Button */}
      {showAcceptButton && onAccept && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && styles.acceptButtonPressed,
            ]}
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>{t('terms.accept')}</Text>
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          </Pressable>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassStroke,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  lastUpdated: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  acceptButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
  },
});

export default TermsOfServiceScreen;
