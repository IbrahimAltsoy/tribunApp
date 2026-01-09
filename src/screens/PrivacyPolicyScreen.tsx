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

const PrivacyPolicyScreen: React.FC<Props> = ({
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
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>
          {t('privacy.lastUpdated', { date: '08 Ocak 2026' })}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Veri Sorumlusu</Text>
          <Text style={styles.paragraph}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin
            veri sorumlusu Amedspor Tribün uygulamasıdır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Toplanan Veriler</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Zorunlu Veriler:</Text>{'\n'}
            • Kullanıcı adı ve profil bilgileri{'\n'}
            • Cihaz bilgileri (model, işletim sistemi){'\n'}
            • Uygulama kullanım verileri{'\n'}
            {'\n'}
            <Text style={styles.bold}>Opsiyonel Veriler:</Text>{'\n'}
            • Fotoğraflar ve görseller{'\n'}
            • Konum bilgisi (paylaşımlar için){'\n'}
            • İletişim tercihleri
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Verilerin Kullanım Amaçları</Text>
          <Text style={styles.paragraph}>
            Kişisel verileriniz aşağıdaki amaçlarla işlenir:{'\n'}
            • Uygulama hizmetlerinin sunulması{'\n'}
            • Kullanıcı deneyiminin iyileştirilmesi{'\n'}
            • Teknik destek sağlanması{'\n'}
            • Güvenlik ve dolandırıcılık önleme{'\n'}
            • İstatistiksel analiz (anonim)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Veri Saklama Süresi</Text>
          <Text style={styles.paragraph}>
            Kişisel verileriniz, toplama amacına uygun süre boyunca ve yasal saklama yükümlülükleri
            çerçevesinde saklanır. Hesabınızı sildiğinizde verileriniz 30 gün içinde sistemden
            silinecektir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Veri Paylaşımı</Text>
          <Text style={styles.paragraph}>
            Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.
            Aşağıdaki durumlarda verileriniz paylaşılabilir:{'\n'}
            • Yasal yükümlülükler{'\n'}
            • Kullanıcı güvenliğinin sağlanması{'\n'}
            • Hizmet sağlayıcılar (bulut, analitik)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. KVKK Hakları</Text>
          <Text style={styles.paragraph}>
            KVKK madde 11 uyarınca aşağıdaki haklara sahipsiniz:{'\n'}
            • Kişisel verilerinizin işlenip işlenmediğini öğrenme{'\n'}
            • İşlenen veriler hakkında bilgi talep etme{'\n'}
            • Verilerin düzeltilmesini isteme{'\n'}
            • Verilerin silinmesini isteme{'\n'}
            • İşleme faaliyetlerine itiraz etme
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Güvenlik Önlemleri</Text>
          <Text style={styles.paragraph}>
            Kişisel verilerinizin güvenliği için teknik ve idari önlemler alınmıştır:{'\n'}
            • Şifreli veri iletimi (SSL/TLS){'\n'}
            • Güvenli veri saklama{'\n'}
            • Erişim kontrolü ve yetkilendirme{'\n'}
            • Düzenli güvenlik denetimleri
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Çerezler ve Takip</Text>
          <Text style={styles.paragraph}>
            Uygulama, kullanıcı deneyimini iyileştirmek için çerezler ve benzeri teknolojiler
            kullanabilir. iOS cihazlarda App Tracking Transparency (ATT) izninizi
            isteyeceğiz.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Çocukların Gizliliği</Text>
          <Text style={styles.paragraph}>
            Uygulamamız 13 yaş altı çocuklara yönelik değildir. 13 yaş altı kullanıcılardan
            bilerek veri toplamayız.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. İletişim</Text>
          <Text style={styles.paragraph}>
            KVKK haklarınızı kullanmak veya gizlilik ile ilgili sorularınız için:{'\n'}
            E-posta: kvkk@amedspor.com{'\n'}
            Adres: [Şirket Adresi]{'\n'}
            Telefon: [İletişim Numarası]
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.badgeText}>KVKK & GDPR Uyumlu</Text>
          </View>
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
            <Text style={styles.acceptButtonText}>{t('privacy.accept')}</Text>
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
  bold: {
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.primary,
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

export default PrivacyPolicyScreen;
