import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { onboardingService } from '../services/onboardingService';
import type { OnboardingSlide } from '../types/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GS_RED = '#E8111A';
const GS_GOLD = '#FFC72C';

type Props = {
  onComplete: () => void;
};

const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = onboardingService.getOnboardingSlides();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      onboardingService.updateCurrentStep(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await onboardingService.completeOnboarding();
    onComplete();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Decorative background circles */}
      <View style={styles.bgCircleLarge} />
      <View style={styles.bgCircleSmall} />

      {/* GS Tribün Logo */}
      <View style={styles.logoRow}>
        <Text style={styles.logoGS}>GS</Text>
        <Text style={styles.logoTribun}>TRİBÜN</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconGlow} />
        <View style={styles.iconRing}>
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon as any} size={68} color={GS_GOLD} />
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t(item.title)}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{t(item.description)}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 28, 6],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#100505', '#0A0A0A', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          {currentIndex < slides.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setCurrentIndex(index);
            onboardingService.updateCurrentStep(index);
          }}
          scrollEventThrottle={16}
        />

        {renderPagination()}

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={[GS_RED, '#C40E16']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === slides.length - 1
                  ? t('onboarding.getStarted')
                  : t('onboarding.next')}
              </Text>
              <Ionicons
                name={
                  currentIndex === slides.length - 1
                    ? 'checkmark-circle'
                    : 'arrow-forward'
                }
                size={20}
                color={colors.white}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 44,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textSecondary,
    fontFamily: typography.medium,
    fontSize: fontSizes.sm,
    letterSpacing: 0.3,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  bgCircleLarge: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
    backgroundColor: 'rgba(232, 17, 26, 0.04)',
    top: '5%',
    alignSelf: 'center',
  },
  bgCircleSmall: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    backgroundColor: 'rgba(255, 199, 44, 0.03)',
    top: '15%',
    alignSelf: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xxl,
    gap: 7,
  },
  logoGS: {
    fontSize: fontSizes.lg,
    fontFamily: typography.extraBold,
    color: GS_GOLD,
    letterSpacing: 1.5,
  },
  logoTribun: {
    fontSize: fontSizes.xs,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: 4,
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 199, 44, 0.05)',
  },
  iconRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 44, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 199, 44, 0.03)',
  },
  iconCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 199, 44, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
    ...Platform.select({
      ios: {
        shadowColor: GS_GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: '88%',
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: GS_GOLD,
    borderRadius: 1,
    marginBottom: spacing.lg,
    opacity: 0.75,
  },
  description: {
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    backgroundColor: GS_GOLD,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  nextButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: GS_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;
