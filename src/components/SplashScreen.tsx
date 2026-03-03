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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Phase 1: Shield bounces in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Phase 2: Text fades in after shield
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Phase 3: Shield subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(shieldAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Dots loading animation — staggered
    const dotAnimation = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ])
      );

    dotAnimation(dot1Anim, 0).start();
    dotAnimation(dot2Anim, 200).start();
    dotAnimation(dot3Anim, 400).start();
  }, []);

  const shieldOpacity = shieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient — dark with subtle red tint at top */}
      <LinearGradient
        colors={['rgba(232,17,26,0.18)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative top arc */}
      <View style={styles.topArc} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Shield Logo */}
        <Animated.View style={[styles.shieldWrapper, { opacity: shieldOpacity }]}>
          {/* Outer glow ring */}
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shieldGlowRing}
          />
          {/* Inner shield */}
          <LinearGradient
            colors={['#1C1C1C', '#111111']}
            style={styles.shieldInner}
          >
            <Ionicons
              name="shield"
              size={52}
              color={colors.primary}
              style={styles.shieldIconBg}
            />
            <View style={styles.gsOverlay}>
              <Text style={styles.gsOverlayText}>GS</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Brand Text */}
        <Animated.View style={[styles.brandRow, { opacity: textFadeAnim }]}>
          <Text style={styles.brandGs}>GS </Text>
          <Text style={styles.brandTribun}>Tribün</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: textFadeAnim }]}>
          Galatasaray Taraftar Uygulaması
        </Animated.Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, styles.dotMid, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const SHIELD_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topArc: {
    position: 'absolute',
    top: -width * 0.3,
    width: width * 1.4,
    height: width * 0.8,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(232,17,26,0.07)',
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
  },

  // Shield
  shieldWrapper: {
    width: SHIELD_SIZE,
    height: SHIELD_SIZE,
    borderRadius: SHIELD_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  shieldGlowRing: {
    position: 'absolute',
    width: SHIELD_SIZE,
    height: SHIELD_SIZE,
    borderRadius: SHIELD_SIZE / 2,
    opacity: 0.3,
  },
  shieldInner: {
    width: SHIELD_SIZE - 8,
    height: SHIELD_SIZE - 8,
    borderRadius: (SHIELD_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(232,17,26,0.4)',
  },
  shieldIconBg: {
    position: 'absolute',
    opacity: 0.15,
  },
  gsOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gsOverlayText: {
    fontSize: 34,
    fontFamily: typography.extraBold,
    color: colors.accent,
    letterSpacing: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
    }),
  },

  // Brand text
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  brandGs: {
    fontSize: fontSizes.xxxl,
    fontFamily: typography.extraBold,
    color: colors.accent,
    letterSpacing: 2,
  },
  brandTribun: {
    fontSize: fontSizes.xxxl,
    fontFamily: typography.extraBold,
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSizes.sm,
    fontFamily: typography.medium,
    color: colors.mutedText,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: spacing.xs / 2,
  },

  // Footer / dots
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dotMid: {
    backgroundColor: colors.accent,
  },
  versionText: {
    fontSize: fontSizes.xs,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1,
  },
});

export default SplashScreen;
