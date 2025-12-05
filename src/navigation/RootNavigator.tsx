import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import BottomTabs from './BottomTabs';
import { colors } from '../theme/colors';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <BottomTabs />
    </NavigationContainer>
  );
};

export default RootNavigator;
