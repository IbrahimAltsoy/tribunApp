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
        <Text style={styles.gs}>GS </Text>
        <Text style={styles.tribun}>Tribün</Text>
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
    fontWeight: '800',
    letterSpacing: 1,
  },
  gs: {
    color: '#FFC72C', // Galatasaray sarı
  },
  tribun: {
    color: '#FFFFFF', // Beyaz
  },
});

export default BihevraLogo;
