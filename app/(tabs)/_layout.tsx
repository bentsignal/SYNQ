import { Tabs } from 'expo-router';
import { View, Animated, Easing } from 'react-native';
import SongOptions from '@/components/sheets/SongOptions';
import { useEffect, useRef } from 'react';
import Server from '@/components/import/wifi/Server';
import { HomeIcon, LibraryIcon } from '@/components/TabBarIcons';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import Purchases from 'react-native-purchases';

const TabLayout = () => {

  const { 
    
    premium, showSongOptions,
    
    setPremium, 
  
  } = useGlobalContext();

  let overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let to;
    if (showSongOptions) {
      to = 0.7;
    }
    else {
      to = 0;
    }
    Animated.timing(overlayOpacity, {
      toValue: to,
      duration: 200,
      easing: showSongOptions ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showSongOptions])

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
    checkPremium();
  }, [])

  return (
    <>
      <View style={{
          position: 'absolute', 
          height: '100%', 
          zIndex: 100,
          width: '100%',
          // display: showSongOptions ? 'flex' : 'none',
          pointerEvents: showSongOptions ? 'auto' : 'none',
        }}
      >
        <SongOptions />
      </View>
      {/* <Animated.View 
          style={{
            position: 'absolute',
            backgroundColor: 'black',
            width: '100%',
            height: '100%',
            zIndex: 80,
            opacity: overlayOpacity,
            // display: showSongOptions ? 'flex' : 'none',
            pointerEvents: showSongOptions ? 'auto' : 'none',
          }}
        /> */}
      <Server />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: Styles.tabBar,
          tabBarLabelStyle: Styles.tabBarLabel
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
              headerShown: false,
            }}
          />
          <Tabs.Screen 
            name='library'
            options={{
              title:'Library',
              tabBarIcon: ({ color, focused }) => (
                <LibraryIcon focused={focused}/>
              ),
              headerShown: false,
            }}
          />
      </Tabs>
    </>
  );

}

export default TabLayout;
