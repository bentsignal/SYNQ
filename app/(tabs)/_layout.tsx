import { Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Easing, View } from 'react-native';
import Server from '@/src/components/import/Server';
import { HomeIcon, LibraryIcon } from '@/src/components/TabBarIcons';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import Overlay from '@/src/components/Overlay';
import NotificationModal from '@/src/components/modals/NotificationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalProgress from '@/src/components/GlobalProgress';
import Top from '@/src/components/Top';
import { useAssets } from 'expo-asset';

const TabLayout = () => {

  
  const { showOverlay, setHaptic, setAdURL } = useGlobalContext();

  const [assets, error] = useAssets([require('@/src/assets/audio/ad.mp3')]);

  useEffect(() => {
    if (error) {
      return;
    }
    if (assets) {
      setAdURL(assets[0].uri);
    }
  }, [assets]);

  useEffect(() => {

    const loadHapticSetting = async () => {
      try {
        const haptic = await AsyncStorage.getItem('haptic');
        setHaptic(haptic === 'false' ? false : true);
      }
      catch {
        setHaptic(true);
      }
    }

    loadHapticSetting();

  }, []);

  return (
    <>
      <NotificationModal />
      <Overlay show={showOverlay} activeOpacity={0.95}/>
      <Server />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: Styles.header,
          header: () => <Top />,
          headerShadowVisible: false,
          headerTitleStyle: Styles.infoText,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: Styles.tabBar,
          tabBarLabelStyle: Styles.h6,
          tabBarIconStyle: {
            marginBottom: 6,
          },
          sceneStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'shift',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.out(Easing.ease),
            },
          },
        }}
      >
          <Tabs.Screen
            name='index'
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <HomeIcon focused={focused}/>
              ),
              animation: 'none',
            }}
          />
          <Tabs.Screen 
            name='library'
            options={{
              title:'Library',
              tabBarIcon: ({ color, focused }) => (
                <LibraryIcon focused={focused}/>
              ),
              animation: 'none',
            }}
          />
      </Tabs>
    </>
  );

}

export default TabLayout;
