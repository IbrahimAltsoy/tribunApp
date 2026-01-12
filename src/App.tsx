import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import RootNavigator from "./navigation/RootNavigator";
import ErrorBoundary from "./components/ErrorBoundary";
import SplashScreen from "./components/SplashScreen";
import { colors } from "./theme/colors";
import { initSentry } from "./utils/sentry";
import { notificationService } from "./services/notificationService";
import "./i18n";

// Initialize error tracking
initSentry();

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Initialize push notifications
  useEffect(() => {
    notificationService.initialize();
  }, []);

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" backgroundColor={colors.background} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <RootNavigator />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
