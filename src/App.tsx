import { StatusBar } from "expo-status-bar";
import React, { useEffect, useCallback, useState } from "react";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import * as ExpoSplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import RootNavigator from "./navigation/RootNavigator";
import ErrorBoundary from "./components/ErrorBoundary";
import SplashScreen from "./components/SplashScreen";
import { colors } from "./theme/colors";
import { initSentry } from "./utils/sentry";
import { notificationService } from "./services/notificationService";
import "./i18n";

// Keep the native splash screen visible while we load resources
ExpoSplashScreen.preventAutoHideAsync();

// Initialize error tracking
initSentry();

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize push notifications
        await notificationService.initialize();

        // Wait for fonts to load
        if (fontsLoaded) {
          // Add a small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 1000));
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen
      await ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" backgroundColor={colors.background} />
        <View
          style={{ flex: 1, backgroundColor: colors.background }}
          onLayout={onLayoutRootView}
        >
          <RootNavigator />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
