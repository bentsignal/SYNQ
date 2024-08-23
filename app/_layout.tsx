import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import GlobalProvider from "@/context/GlobalProvider";
import Purchases from 'react-native-purchases';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RootLayout = () => {

  const [loaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  const [allow, setAllow] = useState(false);

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

    checkAllow();

  }, []);

  useEffect(() => {
    // if (loaded && allow) {
    //   SplashScreen.hideAsync();
    // }
    SplashScreen.hideAsync();
  }, [loaded, allow]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
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