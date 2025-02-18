import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import GlobalProvider from "@/src/context/GlobalProvider";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, restorePurchases } from "@/src/controllers/PurchaseController";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Model from "@/src/models/Model";
import { LogBox } from "react-native";
import CFG from "@/src/constants/Config";
import ThemeProvider from "@/src/context/ThemeProvider";
import PremiumProvider from "@/src/context/PremiumProvider";
import Navigation from "@/app/navigation";
import PlaybackProvider from "@/src/context/PlaybackProvider";
import Sheets from "@/src/components/sheet/Sheets";
import GlobalProgress from '@/src/components/GlobalProgress';
import { PostHogProvider } from 'posthog-react-native';
import { posthogKey } from '@/src/constants/Keys';
import PrivacyProvider from '@/src/context/PrivacyProvider';

LogBox.ignoreLogs(['Require cycle:']);

SplashScreen.setOptions({
  fade: true,
  duration: 300,
})

const RootLayout = () => {

  const [shouldPlayAd, setShouldPlayAd] = useState(false);

  const [fontLoaded] = useFonts({
    JakartaSans: require('@/src/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
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
        await Model.initConnection();
        await Model.createTables();
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
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        host: 'https://us.i.posthog.com',
        enableSessionReplay: true,
        disabled: __DEV__,
      }}
    >
      <ThemeProvider>
        <PremiumProvider>
          <PlaybackProvider>
            <GlobalProvider initShouldPlayAd={shouldPlayAd}>
              <GestureHandlerRootView style={{flex: 1}}>
                <GlobalProgress />
                <Sheets />
                <Navigation />
              </GestureHandlerRootView>
            </GlobalProvider>
          </PlaybackProvider>
        </PremiumProvider>
      </ThemeProvider>
    </PostHogProvider>
  );

}

export default RootLayout;