import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Modal, View, StyleSheet } from "react-native";
import MarsScreen from "../screens/MarsScreen";
import ArchiveScreen from "../screens/ArchiveScreen";
import PlayersScreen from "../screens/PlayersScreen";
import KitsScreen from "../screens/KitsScreen";
import TeamScreen from "../screens/TeamScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import ConsentScreen from "../screens/ConsentScreen";
import NotificationPreferencesScreen from "../components/NotificationPreferences";
import NotificationTestScreen from "../screens/NotificationTestScreen";
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
  const [modalView, setModalView] = useState<'none' | 'terms' | 'privacy' | 'consent' | 'notifications'>('none');

  return (
    <>
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
        <Stack.Screen
          name="Team"
          component={TeamScreen}
          options={{ title: "" }}
        />
        <Stack.Screen name="Settings" options={{ title: "" }}>
          {({ navigation }) => (
            <SettingsScreen
              onViewTerms={() => setModalView('terms')}
              onViewPrivacy={() => setModalView('privacy')}
              onManageConsent={() => setModalView('consent')}
              onManageNotifications={() => setModalView('notifications')}
              onOpenNotificationTest={() => navigation.navigate('NotificationTest')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="NotificationTest"
          component={NotificationTestScreen}
          options={{ title: "Notification Test" }}
        />
      </Stack.Navigator>

      {/* Modals */}
      {modalView === 'terms' && (
        <TermsOfServiceScreen
          onClose={() => setModalView('none')}
          showAcceptButton={false}
        />
      )}
      {modalView === 'privacy' && (
        <PrivacyPolicyScreen
          onClose={() => setModalView('none')}
          showAcceptButton={false}
        />
      )}
      {modalView === 'consent' && (
        <ConsentScreen
          onComplete={() => setModalView('none')}
          onViewTerms={() => setModalView('terms')}
          onViewPrivacy={() => setModalView('privacy')}
        />
      )}
      {modalView === 'notifications' && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalView('none')}
        >
          <NotificationPreferencesScreen onClose={() => setModalView('none')} />
        </Modal>
      )}
    </>
  );
};

export default MarsStack;
