/**
 * Premium Splash Screen Component
 * Modern, animated loading screen with responsive design
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';
import { wp, hp, moderateScale } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up logo
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation for spinner
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[
        colors.background,
        'rgba(0, 191, 71, 0.1)',
        colors.background,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Brand Area */}
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="shield-star"
              size={moderateScale(80)}
              color={colors.primary}
            />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Amedspor</Text>
          <Text style={styles.tagline}>Tribün</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.spinner,
              {
                transform: [
                  { rotate: spin },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="loading"
              size={moderateScale(32)}
              color={colors.primary}
            />
          </Animated.View>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </Animated.View>

      {/* Bottom Branding */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.footerText}>Taraftar Uygulaması</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(80),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(8),
  },
  iconWrapper: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appName: {
    fontSize: fontSizes.xxxl,
    fontFamily: typography.extraBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSizes.lg,
    fontFamily: typography.medium,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: hp(4),
  },
  spinner: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.md,
    fontFamily: typography.medium,
    color: colors.mutedText,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: hp(5),
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
    marginBottom: spacing.sm,
  },
  versionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0, 191, 71, 0.1)',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 71, 0.2)',
  },
  versionText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
});

export default SplashScreen;
