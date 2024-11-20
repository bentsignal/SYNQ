import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import GlobalProvider from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, restorePurchases } from "@/lib/PurchaseManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DataManager from "@/lib/data/DataManager";
import { LogBox } from "react-native";
import CFG from "@/constants/Config";

LogBox.ignoreLogs(['Require cycle:']);

const RootLayout = () => {

  const [theme, setTheme] = useState('');
  const [premium, setPremium] = useState(false);
  const [startup, setStartup] = useState(true);
  const [shouldPlayAd, setShouldPlayAd] = useState(false);

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

  const loadShouldPlayAd = async () => {
    try {
      const playAd = await AsyncStorage.getItem('playAd');
      setShouldPlayAd(playAd === 'true' ? true : false);
    }
    catch {
      setShouldPlayAd(false);
    }
  }

  useEffect(() => {

    SplashScreen.preventAutoHideAsync();

    const checkPurchases = async () => {
      if (CFG.devTestFreeVersion) return;
      await connect();
      const restored = await restorePurchases();
      if (restored !== '') {
        setPremium(true);
      }
    }

    const checkDB = async () => {
      try {
        await DataManager.initConnection();
        await DataManager.createTables();
      }
      catch (error) {
        console.error('Error creatingdatabase:', error);
      }
    }

    loadShouldPlayAd();
    checkDB();
    checkPurchases();
    loadTheme();

  }, []);

  useEffect(() => {
    if (fontLoaded && theme !== '') {
      if (startup) {
        setStartup(false);
        router.push('/bucket');
      }
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [fontLoaded, theme]);

  // force hide splash screen after 7 seconds
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar style="light" />
      <GlobalProvider 
        initTheme={theme}
        initPremium={premium}
        initShouldPlayAd={shouldPlayAd}
      >
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
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
          <Stack.Screen 
            name="player"
            options={{
              presentation: "card",
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: 'transparent' },
              gestureEnabled: true,
              gestureDirection: "vertical",
              fullScreenGestureEnabled: true,
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="queue"
            options={{
              presentation: "card",
              animation: 'fade_from_bottom',
              gestureEnabled: false,
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </GlobalProvider>
    </GestureHandlerRootView>
  );
  
}

export default RootLayout;