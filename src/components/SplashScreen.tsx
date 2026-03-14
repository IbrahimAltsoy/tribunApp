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
import { typography } from '../theme/typography';
import { APP_METADATA } from '../constants/app';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const containerFade = useRef(new Animated.Value(0)).current;
  const markScale   = useRef(new Animated.Value(0.65)).current;
  const markFade    = useRef(new Animated.Value(0)).current;
  const glowPulse   = useRef(new Animated.Value(0)).current;
  const textFade    = useRef(new Animated.Value(0)).current;
  const tagFade     = useRef(new Animated.Value(0)).current;
  const dot1        = useRef(new Animated.Value(0.3)).current;
  const dot2        = useRef(new Animated.Value(0.3)).current;
  const dot3        = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 0ms — bg fade in
    Animated.timing(containerFade, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    // 100ms — logo mark springs in
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(markScale, {
          toValue: 1, tension: 55, friction: 7, useNativeDriver: true,
        }),
        Animated.timing(markFade, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // 450ms — wordmark fades in
    setTimeout(() => {
      Animated.timing(textFade, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }).start();
    }, 450);

    // 700ms — tagline + dots
    setTimeout(() => {
      Animated.timing(tagFade, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }).start();
    }, 700);

    // glow pulse loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowPulse, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }, 600);

    // loading dots
    const dot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );
    dot(dot1, 800).start();
    dot(dot2, 1000).start();
    dot(dot3, 1200).start();
  }, []);

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <Animated.View style={[styles.root, { opacity: containerFade }]}>
      {/* Background */}
      <LinearGradient
        colors={['rgba(200,15,25,0.22)', 'rgba(10,10,10,0)', 'rgba(10,10,10,0)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial-like bottom accent */}
      <LinearGradient
        colors={['rgba(10,10,10,0)', 'rgba(180,10,20,0.06)']}
        locations={[0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>

        {/* ── Logo Mark ── */}
        <Animated.View style={[
          styles.markWrapper,
          { opacity: markFade, transform: [{ scale: markScale }] },
        ]}>
          {/* Outer glow ring — pulses */}
          <Animated.View style={[
            styles.glowRing,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}>
            <LinearGradient
              colors={[colors.primary, colors.accent, colors.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Mid ring */}
          <View style={styles.midRing} />

          {/* Inner badge */}
          <LinearGradient
            colors={['#1E1E1E', '#111111', '#0A0A0A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.innerBadge}
          >
            {/* Subtle inner glow */}
            <LinearGradient
              colors={['rgba(200,15,25,0.18)', 'rgba(200,15,25,0)']}
              style={styles.innerGlow}
            />
            {/* Flame icon */}
            <View style={styles.flameContainer}>
              <Ionicons name="flame" size={44} color="rgba(200,15,25,0.12)" style={styles.flameBg} />
              <LinearGradient
                colors={[colors.accent, colors.primary]}
                start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
                style={styles.flameGrad}
              >
                <Ionicons name="flame" size={36} color="transparent" />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Wordmark ── */}
        <Animated.View style={[styles.wordmark, { opacity: textFade }]}>
          <Text style={styles.wordGs}>GS</Text>
          <View style={styles.wordSep} />
          <Text style={styles.wordTribun}>TRİBÜN</Text>
        </Animated.View>

        {/* ── Tagline ── */}
        <Animated.Text style={[styles.tagline, { opacity: tagFade }]}>
          Galatasaray Taraftar Uygulaması
        </Animated.Text>

      </View>

      {/* ── Footer ── */}
      <Animated.View style={[styles.footer, { opacity: tagFade }]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, styles.dotAccent, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
        <Text style={styles.version}>v{APP_METADATA.VERSION}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const MARK = 120;
const GLOW = MARK + 36;
const MID  = MARK + 10;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },

  // Mark
  markWrapper: {
    width: MARK,
    height: MARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  glowRing: {
    position: 'absolute',
    width: GLOW,
    height: GLOW,
    borderRadius: GLOW / 2,
    overflow: 'hidden',
  },
  midRing: {
    position: 'absolute',
    width: MID,
    height: MID,
    borderRadius: MID / 2,
    borderWidth: 1,
    borderColor: 'rgba(200,15,25,0.35)',
  },
  innerBadge: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(200,15,25,0.3)',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MARK * 0.55,
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameBg: {
    position: 'absolute',
  },
  flameGrad: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
    }),
  },

  // Wordmark
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  wordGs: {
    fontSize: 36,
    fontFamily: typography.extraBold ?? typography.bold,
    color: colors.accent,
    letterSpacing: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
      },
    }),
  },
  wordSep: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
  },
  wordTribun: {
    fontSize: 28,
    fontFamily: typography.extraBold ?? typography.bold,
    color: colors.white,
    letterSpacing: 5,
  },

  // Tagline
  tagline: {
    fontSize: 11,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    gap: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  dotAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  version: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
  },
});

export default SplashScreen;
