import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated';

import { Colors } from "@/constants/Colors";

const RootLayout = () => {

  const [loaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default RootLayout;