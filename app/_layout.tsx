import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { StatusBar } from "react-native";
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import GlobalProvider from "@/context/GlobalProvider";
import Purchases from 'react-native-purchases';
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RootLayout = () => {

  const [fontLoaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      return theme ? theme : Colors.main;
    }
    catch {
      return Colors.main;
    }
  }

  const [allow, setAllow] = useState(false);
  const [theme, setTheme] = useState('');

  const bypassAllow = true;

  useEffect(() => {

    SplashScreen.preventAutoHideAsync();

    const checkConnection = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        return networkState.isConnected ? networkState.isConnected : false;
      }
      catch {
        return false;
      }
    }

    const checkSubscribed = async () => {
      // TODO: Store file when purchasing premium, then check here for file
      return true;
    }

    const checkAllow = async () => {
      try {
        if (bypassAllow) {
          setAllow(true);
        }
        else if (await checkSubscribed()) {
          setAllow(true);
        }
        else if (await checkConnection()) {
          setAllow(true);
        }
        else {
          setAllow(false);
        }
      }
      catch {
        setAllow(false);
      }
    }

    // checkAllow();

    loadTheme().then((theme: string) => {
      setTheme(theme);
    })
    .catch(() => {
      setTheme(Colors.main);
    })

  }, []);

  useEffect(() => {
    if (fontLoaded && theme !== '') {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, allow, theme]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar barStyle="light-content" />
      <GlobalProvider initTheme={theme}>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false, 
              animation: 'none' 
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