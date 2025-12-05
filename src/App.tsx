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
import { colors } from "./theme/colors";

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
      <StatusBar style="light" backgroundColor={colors.background} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
};

export default App;
