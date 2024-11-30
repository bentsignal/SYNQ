import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Easing, View } from 'react-native';
import Server from '@/components/import/wifi/Server';
import { HomeIcon, LibraryIcon } from '@/components/TabBarIcons';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import Overlay from '@/components/Overlay';
import NotificationModal from '@/components/modals/NotificationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalProgress from '@/components/GlobalProgress';
import Top from '@/components/Top';
import { useAssets } from 'expo-asset';
import { useThemeContext } from '@/context/ThemeProvider';
import MiniPlayer from '@/components/player/MiniPlayer';

const TabLayout = () => {

  const tabRef = useRef<any>(null);

  const { showOverlay, setHaptic, setAdURL } = useGlobalContext();

  const { theme } = useThemeContext();

  const [assets, error] = useAssets([require('@/assets/audio/ad.mp3')]);

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
      <GlobalProgress />
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
