import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import HomeScreen from '../screens/HomeScreen';
import FixtureScreen from '../screens/FixtureScreen';
import FeedScreen from '../screens/FeedScreen';
import ChatScreen from '../screens/ChatScreen';
import MarsScreen from '../screens/MarsScreen';
import { colors } from '../theme/colors';

export type BottomTabParamList = {
  Home: undefined;
  Fixture: undefined;
  Feed: undefined;
  Chat: undefined;
  Mars: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const iconMap: Record<keyof BottomTabParamList, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Fixture: 'calendar',
  Feed: 'rss',
  Chat: 'message-circle',
  Mars: 'hexagon',
};

const BottomTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: Platform.OS === "ios" ? 88 : 65,
        paddingBottom: Platform.OS === "ios" ? 24 : 8,
        paddingTop: 8,
        elevation: 0,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
      },
      tabBarIcon: ({ color, size, focused }) => {
        const iconName = iconMap[route.name as keyof BottomTabParamList];
        return (
          <View style={styles.iconContainer}>
            {focused && <View style={styles.activeIndicator} />}
            <Feather
              name={iconName}
              color={color}
              size={focused ? size + 2 : size}
            />
          </View>
        );
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarLabel: "Ana Sayfa" }}
    />
    <Tab.Screen
      name="Fixture"
      component={FixtureScreen}
      options={{ tabBarLabel: "Fikstür" }}
    />
    <Tab.Screen
      name="Feed"
      component={FeedScreen}
      options={{ tabBarLabel: "Akış" }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{ tabBarLabel: "Sohbet" }}
    />
    <Tab.Screen
      name="Mars"
      component={MarsScreen}
      options={{ tabBarLabel: "Marşlar" }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default BottomTabs;