import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import GlobalProvider from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, restorePurchases } from "@/lib/PurchaseManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RootLayout = () => {

  const [theme, setTheme] = useState('');
  const [premium, setPremium] = useState(false);
  const [startup, setStartup] = useState(true);

  const [fontLoaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      setTheme(theme ? theme : Colors.main);
    }
    catch {
      setTheme(Colors.main);
    }
  }

  useEffect(() => {

    SplashScreen.preventAutoHideAsync();

    const checkPurchases = async () => {
      const first = await AsyncStorage.getItem('first');
      if (first !== 'false') {
        await AsyncStorage.setItem('first', 'false');
        await connect();
        const restored = await restorePurchases();
        if (restored !== '') {
          setPremium(true);
        }
      }
    }

    checkPurchases();
    loadTheme();

  }, []);

  useEffect(() => {
    if (fontLoaded && theme !== '') {
      if (startup) {
        setStartup(false);
        router.push('bucket');
      }
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [fontLoaded, theme]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar style="light" />
      <GlobalProvider 
        initTheme={theme}
        initPremium={premium}
      >
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade'
            }} 
          />
          <Stack.Screen
            name="bucket"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="tracking"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen 
            name="settings"
            options={{
              presentation: "modal",
              headerShown: false,
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
    </GestureHandlerRootView>
  );
  
}

export default RootLayout;