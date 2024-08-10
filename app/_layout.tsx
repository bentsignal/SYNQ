import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import 'react-native-reanimated';
import GlobalProvider from "@/context/GlobalProvider";

const RootLayout = () => {

  const [loaded] = useFonts({
    JakartaSans: require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf')
  });

  const [allow, setAllow] = useState(false);

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
      return true;
    }

    const checkAllow = async () => {
      try {
        if (await checkSubscribed()) {
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
    if (loaded && allow) {
      SplashScreen.hideAsync();
    }
  }, [loaded, allow]);

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
  );
  
}

export default RootLayout;