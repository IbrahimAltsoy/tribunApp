import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform, PanResponder } from "react-native";
import { BlurView } from "expo-blur";
import HomeScreen from "../screens/HomeScreen";
import FixtureScreen from "../screens/FixtureScreen";
import FeedScreen from "../screens/FeedScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileStack from "./ProfileStack";
import { colors } from "../theme/colors";

export type BottomTabParamList = {
  Home: undefined;
  Fixture: undefined;
  Feed: { newsId?: string; origin?: "Home" } | undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ORDER: Array<keyof BottomTabParamList> = [
  "Home", "Fixture", "Feed", "Chat", "Profile",
];

const tabLabels: Record<keyof BottomTabParamList, string> = {
  Home: "Ana Sayfa",
  Fixture: "Fikstür",
  Feed: "Akış",
  Chat: "Sohbet",
  Profile: "Profil",
};

const BottomTabs: React.FC = () => {
  // Aktif tab indeksini ve tab navigation referansını izle
  const currentIdxRef = useRef<number>(0);
  const tabNavRef     = useRef<any>(null);

  const panResponder = useRef(
    PanResponder.create({
      // Yalnızca belirgin yatay hareketleri yakala (dikey scroll'u engelleme)
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 2.8 && Math.abs(gs.dx) > 35,

      // Dokunma olayının sahipliğini bırakma (ScrollView'ların çalmasını önler)
      onPanResponderTerminationRequest: () => false,

      onPanResponderRelease: (_, gs) => {
        const nav = tabNavRef.current;
        if (!nav) return;

        const swipeLeft  = gs.dx < -110 && gs.vx < -0.40;
        const swipeRight = gs.dx >  110 && gs.vx >  0.40;

        if (swipeLeft) {
          const next = Math.min(currentIdxRef.current + 1, TAB_ORDER.length - 1);
          if (next !== currentIdxRef.current) nav.navigate(TAB_ORDER[next]);
        } else if (swipeRight) {
          const prev = Math.max(currentIdxRef.current - 1, 0);
          if (prev !== currentIdxRef.current) nav.navigate(TAB_ORDER[prev]);
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginBottom: Platform.OS === "ios" ? 0 : 2,
          },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.borderLight,
            borderTopWidth: 1,
            height: Platform.OS === "ios" ? 88 : 64,
            paddingBottom: Platform.OS === "ios" ? 24 : 6,
            paddingTop: 6,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "500",
                color,
                marginTop: 2,
              }}
            >
              {tabLabels[route.name as keyof BottomTabParamList]}
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => {
            const s = focused ? size + 1 : size - 1;
            if (route.name === "Profile") {
              return (
                <View style={styles.iconContainer}>
                  {focused && <View style={styles.activeIndicator} />}
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    color={color}
                    size={s}
                  />
                </View>
              );
            }
            const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
              Home: "home",
              Fixture: "bar-chart-2",
              Feed: "rss",
              Chat: "message-circle",
            };
            return (
              <View style={styles.iconContainer}>
                {focused && <View style={styles.activeIndicator} />}
                <Feather name={iconMap[route.name]} color={color} size={s} />
              </View>
            );
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            ) : undefined,
        })}
        // Her tab odaklandığında navigation ref ve index'i güncelle
        screenListeners={({ navigation, route }) => ({
          focus: () => {
            tabNavRef.current     = navigation;
            currentIdxRef.current = TAB_ORDER.indexOf(route.name as keyof BottomTabParamList);
          },
        })}
      >
        <Tab.Screen name="Home"    component={HomeScreen}    />
        <Tab.Screen name="Fixture" component={FixtureScreen} />
        <Tab.Screen name="Feed"    component={FeedScreen}    />
        <Tab.Screen name="Chat"    component={ChatScreen}    />
        <Tab.Screen name="Profile" component={ProfileStack}  />
      </Tab.Navigator>
    </View>
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
    width: 28,
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
