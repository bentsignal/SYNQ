import { Tabs } from 'expo-router';
import Server from '@/components/import/wifi/Server';
import { HomeIcon, SettingsIcon } from '@/components/TabBarIcons';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';

const TabLayout = () => {

  return (
    <>
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
            name='settings'
            options={{
              title:'Settings',
              tabBarIcon: ({ color, focused }) => (
                <SettingsIcon focused={focused}/>
              ),
              headerShown: false,
            }}
          />
      </Tabs>
    </>
  );

}

export default TabLayout;
