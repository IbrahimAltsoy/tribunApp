import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BihevraLogoProps {
  size?: 'small' | 'medium' | 'large' | 'splash';
  style?: ViewStyle;
}

const BihevraLogo: React.FC<BihevraLogoProps> = ({ size = 'medium', style }) => {
  const fontSize = {
    small: 24,
    medium: 36,
    large: 48,
    splash: 64,
  }[size];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize }]}>
        <Text style={styles.bi}>Bi</Text>
        <Text style={styles.hevra}>hevra</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  bi: {
    color: '#00A651', // Yeşil
  },
  hevra: {
    color: '#FFFFFF', // Beyaz
  },
});

export default BihevraLogo;
