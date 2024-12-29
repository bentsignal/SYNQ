import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import GlobalProvider from "@/context/GlobalProvider";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, restorePurchases } from "@/lib/controllers/PurchaseController";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DataManager from "@/lib/data/DataManager";
import { LogBox } from "react-native";
import CFG from "@/constants/Config";
import ThemeProvider from "@/context/ThemeProvider";
import PremiumProvider from "@/context/PremiumProvider";
import Navigation from "@/app/navigation";
import PlaybackProvider from "@/context/PlaybackProvider";
import Sheets from "@/components/sheet/Sheets";
import GlobalProgress from '@/components/GlobalProgress';

LogBox.ignoreLogs(['Require cycle:']);

SplashScreen.setOptions({
  fade: true,
  duration: 300,
})

const RootLayout = () => {

  const [shouldPlayAd, setShouldPlayAd] = useState(false);

  const [fontLoaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  useEffect(() => {

    SplashScreen.preventAutoHideAsync();

    // automatically hide splash screen after 7 seconds
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 7000);

    const loadShouldPlayAd = async () => {
      try {
        const playAd = await AsyncStorage.getItem('playAd');
        setShouldPlayAd(playAd === 'true' ? true : false);
      }
      catch {
        setShouldPlayAd(false);
      }
    }

    const checkDB = async () => {
      try {
        await DataManager.initConnection();
        await DataManager.createTables();
      }
      catch (error) {
        console.error('Error creating database:', error);
      }
    }

    loadShouldPlayAd();
    checkDB();

  }, []);

  // hide splash screen after fonts are loaded
  useEffect(() => {
    if (fontLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [fontLoaded]);

  return (
    <ThemeProvider>
      <PremiumProvider>
        <PlaybackProvider>
          <GlobalProvider
            initShouldPlayAd={shouldPlayAd}
            children={
              <>
                <GlobalProgress />
                <Sheets />
                <GestureHandlerRootView style={{flex: 1}}>
                  <Navigation />
                </GestureHandlerRootView>
              </>
            }
          />
        </PlaybackProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
  
}

export default RootLayout;