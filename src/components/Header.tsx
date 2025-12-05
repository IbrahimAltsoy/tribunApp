import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSizes, typography } from '../theme/typography';

type HeaderProps = {
  onPressNotifications?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onPressNotifications }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>AMEDSPOR</Text>
        <Ionicons
          name="notifications-outline"
          size={26}
          color={colors.text}
          onPress={onPressNotifications}
        />
      </View>
      <View style={styles.underline} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  underline: {
    marginTop: spacing.sm,
    height: 3,
    width: 110,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default Header;
