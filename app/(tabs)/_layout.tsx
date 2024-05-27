import { Tabs } from 'expo-router';
import React from 'react';

import { HomeIcon, LibraryIcon } from '@/components/TabBarIcons'
import { Colors } from '@/constants/Colors'

const TabLayout = () => {
    return (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.tabActive,
            tabBarInactiveTintColor: Colors.tabInactive,
            tabBarStyle: {
              backgroundColor: Colors.footer,
              height: '11%',
              paddingTop: 10
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 'bold'
            }
          }}
          sceneContainerStyle={{
            backgroundColor: Colors.background,
          }}
        >
            <Tabs.Screen
              name='home'
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
                )
              }}
            />
        </Tabs>
    )
}

export default TabLayout;
