import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import { userSafetyService } from '../services/userSafetyService';
import * as Application from 'expo-application';

const IS_IOS = Platform.OS === 'ios';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EulaModalProps {
  visible: boolean;
  sessionId: string;
  onAccept: () => void;
}

const CURRENT_EULA_VERSION = '1.0';

const EulaModal: React.FC<EulaModalProps> = ({ visible, sessionId, onAccept }) => {
  const { t } = useTranslation();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const deviceInfo = `${Platform.OS} ${Platform.Version}`;
      const appVersion = Application.nativeApplicationVersion || '1.0.0';

      const response = await userSafetyService.acceptEula(
        sessionId,
        CURRENT_EULA_VERSION,
        deviceInfo,
        appVersion
      );

      if (response.success) {
        onAccept();
      }
    } catch (error) {
      console.error('Failed to accept EULA:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={IS_IOS ? 30 : 20} tint="dark" style={styles.blur}>
          <View style={styles.container}>
            {/* Header */}
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Ionicons name="shield-checkmark" size={32} color={colors.white} />
              <Text style={styles.headerTitle}>{t('eula.title', 'Kullanim Kosullari')}</Text>
            </LinearGradient>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.sectionTitle}>
                {t('eula.welcome', 'Hosgeldiniz!')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.welcomeText',
                  'Uygulamamizi kullanmadan once asagidaki kullanim kosullarini okumanizi ve kabul etmenizi rica ederiz.'
                )}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('eula.rules', 'Topluluk Kurallari')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.rulesText',
                  '- Diger kullanicilara saygi gosterin\n- Nefret soylemi, taciz veya siddet iceren icerikler paylasmayin\n- Spam yapmaktan kacinin\n- Uygunsuz veya muhalefet icerikler paylasmayin'
                )}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('eula.privacy', 'Gizlilik')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.privacyText',
                  'Anonim olarak katiliyorsunuz. Session ID\'niz cihazinizda saklanir ve sadece engelleme/raporlama islemleri icin kullanilir.'
                )}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('eula.content', 'Icerik Moderasyonu')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.contentText',
                  'Paylastiginiz icerikler moderasyon ekibimiz tarafindan incelenebilir. Topluluk kurallarini ihlal eden icerikler kaldirilabilir.'
                )}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('eula.blocking', 'Engelleme ve Raporlama')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.blockingText',
                  'Rahatsiz edici kullanicilari engelleyebilir veya uygunsuz icerikleri raporlayabilirsiniz. Raporlariniz gizli tutulur.'
                )}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('eula.acceptance', 'Kabul')}
              </Text>
              <Text style={styles.paragraph}>
                {t(
                  'eula.acceptanceText',
                  'Bu uygulamayi kullanarak yukaridaki kosullari kabul etmis sayilirsiniz. Kosullarin ihlali hesabinizin askiya alinmasina yol acabilir.'
                )}
              </Text>

              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>
                  {t('eula.version', 'Surum')}: {CURRENT_EULA_VERSION}
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {!hasScrolledToEnd && (
                <Text style={styles.scrollHint}>
                  {t('eula.scrollHint', 'Devam etmek icin asagi kaydin')}
                </Text>
              )}
              <Pressable
                style={[
                  styles.acceptButton,
                  !hasScrolledToEnd && styles.acceptButtonDisabled,
                ]}
                onPress={handleAccept}
                disabled={!hasScrolledToEnd || isAccepting}
              >
                <LinearGradient
                  colors={
                    hasScrolledToEnd
                      ? [colors.primary, colors.accent]
                      : ['rgba(100, 100, 100, 0.5)', 'rgba(100, 100, 100, 0.5)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.acceptButtonGradient}
                >
                  {isAccepting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.white}
                      />
                      <Text style={styles.acceptButtonText}>
                        {t('eula.accept', 'Kabul Ediyorum')}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: 'rgba(19, 30, 19, 0.95)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.glassStroke,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.white,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  paragraph: {
    fontSize: fontSizes.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  versionContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
    alignItems: 'center',
  },
  versionText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: colors.textTertiary,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassStroke,
  },
  scrollHint: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  acceptButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  acceptButtonText: {
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    color: colors.white,
  },
});

export default EulaModal;
