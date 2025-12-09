import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MarsScreen from "../screens/MarsScreen";
import ArchiveScreen from "../screens/ArchiveScreen";
import PlayersScreen from "../screens/PlayersScreen";
import KitsScreen from "../screens/KitsScreen";
import { MarsStackParamList } from "./types";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

const Stack = createNativeStackNavigator<MarsStackParamList>();

const screenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitleStyle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: 18,
  },
  headerTintColor: colors.text,
  contentStyle: {
    backgroundColor: colors.background,
  },
} as const;

const MarsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MarsHome"
        component={MarsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="Players"
        component={PlayersScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="Kits"
        component={KitsScreen}
        options={{ title: "" }}
      />
    </Stack.Navigator>
  );
};

export default MarsStack;
