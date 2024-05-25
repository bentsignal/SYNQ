import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { Colors } from '@/constants/Colors'

export default function TabLayout() {
    return (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.tabIconSelected,
            tabBarInactiveTintColor: Colors.tabIconDefault,
            tabBarStyle: {
              backgroundColor: Colors.footer,
            }
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
                  <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color}/>
                )
              }} 
            />
            <Tabs.Screen 
              name='library'
              options={{
                title:'Library',
                tabBarIcon: ({ color, focused }) => (
                  <TabBarIcon name={focused ? 'library' : 'library-outline'} color={color}/>
                )
              }}
            />
        </Tabs>
    )
}