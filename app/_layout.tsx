import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import GlobalProvider from "@/context/GlobalProvider";

const RootLayout = () => {

  const [loaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false, 
            animation: 'none' 
          }} 
        />
        <Stack.Screen 
          name="premium"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </GlobalProvider>
  );
  
}

export default RootLayout;