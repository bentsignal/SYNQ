import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import GlobalProvider from "@/context/GlobalProvider";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, restorePurchases } from "@/lib/PurchaseManager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DataManager from "@/lib/data/DataManager";
import { LogBox } from "react-native";
import CFG from "@/constants/Config";
import ThemeProvider from "@/context/ThemeProvider";
import PremiumProvider from "@/context/PremiumProvider";
import Navigation from "@/app/navigation";

LogBox.ignoreLogs(['Require cycle:']);

const RootLayout = () => {

  const [premium, setPremium] = useState(false);
  const [shouldPlayAd, setShouldPlayAd] = useState(false);

  const [fontLoaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

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

  }, []);

  // hide splash screen after fonts are loaded
  useEffect(() => {
    if (fontLoaded) {
      router.push('/bucket');
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
    // hide splash screen after 7 seconds if fonts are not loaded
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);
  }, [fontLoaded]);

  return (
    <ThemeProvider>
      <PremiumProvider>
        <GlobalProvider
          initPremium={premium}
          initShouldPlayAd={shouldPlayAd}
          children={
            <GestureHandlerRootView style={{flex: 1}}>
              <Navigation />
            </GestureHandlerRootView>
          }
        />
      </PremiumProvider>
    </ThemeProvider>
  );
  
}

export default RootLayout;