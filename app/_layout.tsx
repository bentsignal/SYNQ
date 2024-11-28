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

  useEffect(() => {
    if (fontLoaded) {
      router.push('/bucket');
    }
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, [fontLoaded]);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);
  }, []);

  return (
    <PremiumProvider>
      <ThemeProvider>
        <GlobalProvider
          initPremium={premium}
          initShouldPlayAd={shouldPlayAd}
          children={
            <GestureHandlerRootView style={{flex: 1}}>
              <Navigation />
            </GestureHandlerRootView>
          }
        />
      </ThemeProvider>
    </PremiumProvider>
  );
  
}

export default RootLayout;