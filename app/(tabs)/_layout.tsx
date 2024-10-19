import { Tabs } from 'expo-router';
import { View, StyleSheet, Dimensions } from 'react-native';
import SongOptions from '@/components/sheets/SongOptions';
import { useEffect, useRef } from 'react';
import Server from '@/components/import/wifi/Server';
import { HomeIcon, LibraryIcon } from '@/components/TabBarIcons';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import Purchases from 'react-native-purchases';
import Overlay from '@/components/Overlay';
import NotificationModal from '@/components/modals/NotificationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalProgress from '@/components/GlobalProgress';
import Top from '@/components/Top';

const TabLayout = () => {

  const { 
    
    premium, showSongOptions, showOverlay,
  
    setPremium, setHaptic, setShowSongOptions
  
  } = useGlobalContext();

  const Local = StyleSheet.create({
    tabBar: {
      borderTopWidth: 1,
      borderTopColor: Colors.popup,
      backgroundColor: Colors.footer,
      height: '11%',
      paddingTop: 10,
      paddingBottom: Dimensions.get('screen').height < 700 ? 15 : 30
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    bottomSheetWrapper: {
      position: 'absolute', 
      height: '100%', 
      zIndex: 100,
      width: '100%',
      pointerEvents: showSongOptions ? 'auto' : 'none',
    },
  });

  useEffect(() => {

    const checkPremium = async () => {
      try {
        Purchases.configure({
          apiKey: 'appl_qzTfhRrmSegqQhRUukTmiUsVMIq',
          appUserID: null,
        });
        const customerInfo = await Purchases.getCustomerInfo();
        const active = customerInfo.activeSubscriptions;
        const purchases = customerInfo.nonSubscriptionTransactions;
        if (active.length > 0) {
          setPremium(true);
        }
        else if (purchases.length > 0 && purchases[0].productIdentifier === 'SYNQPremiumLifetime') {
          setPremium(true);
        }
        else {
          setPremium(false);
        }
      }
      catch (error) {
        console.log('error checking premium');
      }
    }

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
    checkPremium();

  }, []);

  return (
    <>
      <GlobalProgress />
      <View style={Local.bottomSheetWrapper}>
        <SongOptions 
          show={showSongOptions} 
          setShow={setShowSongOptions}
        />
      </View>
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
          tabBarStyle: Local.tabBar,
          tabBarLabelStyle: Styles.h6
        }}
        sceneContainerStyle={{
          backgroundColor: Colors.background,
        }}
      >
          <Tabs.Screen
            name='index'
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <HomeIcon focused={focused}/>
              ),
            }}
          />
          <Tabs.Screen 
            name='library'
            options={{
              title:'Library',
              tabBarIcon: ({ color, focused }) => (
                <LibraryIcon focused={focused}/>
              ),
              // header: () => <Header />
            }}
          />
      </Tabs>
    </>
  );

}

export default TabLayout;
