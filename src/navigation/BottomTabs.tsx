import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
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
      },
      tabBarIcon: ({ color, size }) => {
        const iconName = iconMap[route.name as keyof BottomTabParamList];
        return <Feather name={iconName} color={color} size={size} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Fixture" component={FixtureScreen} />
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Mars" component={MarsScreen} />
  </Tab.Navigator>
);

export default BottomTabs;
