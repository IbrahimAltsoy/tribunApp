import { StatusBar } from "expo-status-bar";
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
import { colors } from "./theme/colors";
import { initSentry } from "./utils/sentry";
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

  if (!fontsLoaded) {
    return null;
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
