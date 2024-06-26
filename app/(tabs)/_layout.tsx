import { Tabs } from 'expo-router';
import { Dimensions } from 'react-native';

import { HomeIcon, LibraryIcon, SettingsIcon } from '@/components/TabBarIcons'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'

const TabLayout = () => {
    return (
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
              }}
            />
            <Tabs.Screen 
              name='settings'
              options={{
                title:'Settings',
                tabBarIcon: ({ color, focused }) => (
                  <SettingsIcon focused={focused}/>
                )
              }}
            />
        </Tabs>
    )
}

export default TabLayout;
