import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import HomeScreen from "../screens/HomeScreen";
import FixtureScreen from "../screens/FixtureScreen";
import FeedScreen from "../screens/FeedScreen";
import ChatScreen from "../screens/ChatScreen";
import MarsStack from "./MarsStack";
import { colors } from "../theme/colors";

export type BottomTabParamList = {
  Home: undefined;
  Fixture: undefined;
  Feed: { newsId?: string; origin?: "Home" } | undefined;
  Chat: undefined;
  Mars: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const iconMap: Record<keyof BottomTabParamList, keyof typeof Feather.glyphMap> =
  {
    Home: "home",
    Fixture: "bar-chart-2",
    Feed: "rss",
    Chat: "message-circle",
    Mars: "archive",
  };

type AmedIconProps = {
  color: string;
  size: number;
};

const AmedWallsIcon: React.FC<AmedIconProps> = ({ color, size }) => {
  const width = size + 8;
  const height = size + 2;
  const wallHeight = Math.max(3, Math.round(size * 0.18));
  const towerHeight = Math.max(8, Math.round(size * 0.45));
  const towerWidth = Math.max(7, Math.round(size * 0.36));
  const crenelHeight = Math.max(4, Math.round(size * 0.22));
  const crenelWidth = Math.max(5, Math.round(size * 0.24));
  const gap = Math.max(2, Math.round(size * 0.1));
  const gradient = [colors.primary, colors.accent] as const;

  return (
    <View style={{ width, height, justifyContent: "flex-end" }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: wallHeight,
          borderRadius: 2,
        }}
      />
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          bottom: wallHeight,
          left: Math.round((width - towerWidth) / 2),
          width: towerWidth,
          height: towerHeight,
          borderRadius: 2,
        }}
      />
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          bottom: wallHeight,
          right: gap,
          width: crenelWidth,
          height: crenelHeight,
          borderRadius: 2,
        }}
      />
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          bottom: wallHeight,
          left: gap,
          width: crenelWidth,
          height: crenelHeight,
          borderRadius: 2,
        }}
      />
    </View>
  );
};

const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 56,
          paddingBottom: Platform.OS === "ios" ? 24 : 4,
          paddingTop: 4,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "Mars") {
            const amedSize = focused ? size + 2 : size;
            return (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeIndicator} />}
                <AmedWallsIcon color={color} size={amedSize} />
              </View>
            );
          }
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
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={30}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fixture" component={FixtureScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Mars" component={MarsStack} />
    </Tab.Navigator>
  );
};

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
