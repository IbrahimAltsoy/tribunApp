import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography, fontSizes } from '../theme/typography';

const { width, height } = Dimensions.get('window');

interface GoalCelebrationProps {
  visible: boolean;
  teamName: string;
  playerName: string;
  minute: number;
  onComplete: () => void;
}

export const GoalCelebration: React.FC<GoalCelebrationProps> = ({
  visible,
  teamName,
  playerName,
  minute,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate out after 3 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
      }, 3000);
    }
  }, [visible, scaleAnim, fadeAnim, slideAnim, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Goal Icon */}
        <Animated.Text
          style={[
            styles.goalIcon,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          ⚽
        </Animated.Text>

        {/* Goal Text */}
        <Text style={styles.goalText}>GOL!</Text>

        {/* Team Name */}
        <Text style={styles.teamName}>{teamName}</Text>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.minute}>{minute}'</Text>
        </View>
      </Animated.View>

      {/* Background overlay */}
      <Animated.View
        style={[
          styles.background,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 24,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    minWidth: width * 0.8,
  },
  goalIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  goalText: {
    fontSize: 48,
    fontFamily: typography.bold,
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  teamName: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerName: {
    fontSize: fontSizes.lg,
    fontFamily: typography.semiBold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  minute: {
    fontSize: fontSizes.lg,
    fontFamily: typography.bold,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
