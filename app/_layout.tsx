import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

export default function RootLayout() {

  SplashScreen.preventAutoHideAsync();

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
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
    </Stack>
  );
}
