import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Modal, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import ConsentScreen from "../screens/ConsentScreen";
import NotificationPreferencesScreen from "../components/NotificationPreferences";
import { ProfileStackParamList } from "./types";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ marginLeft: -8, padding: 8 }}>
    <Ionicons name="chevron-back" size={28} color={colors.text} />
  </TouchableOpacity>
);

const screenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitleStyle: {
    color: colors.text,
    fontFamily: typography.semiBold,
    fontSize: 18,
  },
  headerTintColor: colors.text,
  headerBackTitleVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
} as const;

const ProfileStack: React.FC = () => {
  const [modalView, setModalView] = useState<'none' | 'terms' | 'privacy' | 'consent' | 'notifications'>('none');

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="ProfileHome"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={ProfileEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          options={({ navigation }) => ({
            title: "",
            ...(Platform.OS === "ios" && {
              headerLeft: () => <CustomBackButton onPress={() => navigation.goBack()} />,
            }),
          })}
        >
          {({ navigation }) => (
            <SettingsScreen
              onViewTerms={() => setModalView('terms')}
              onViewPrivacy={() => setModalView('privacy')}
              onManageConsent={() => setModalView('consent')}
              onManageNotifications={() => setModalView('notifications')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      {modalView === 'terms' && (
        <TermsOfServiceScreen onClose={() => setModalView('none')} showAcceptButton={false} />
      )}
      {modalView === 'privacy' && (
        <PrivacyPolicyScreen onClose={() => setModalView('none')} showAcceptButton={false} />
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

export default ProfileStack;
