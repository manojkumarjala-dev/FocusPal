import { Redirect, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useWindowDimensions, Text, View } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/firebaseConfig';
import { ThemeProvider } from 'react-native-paper';
import { AuthProvider } from '@/AuthProvider';
export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!auth.currentUser) {
    return <Redirect href="/login" />;
  }

  const isSmallScreen = width < 300;

  return (
    <AuthProvider>


    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, 
          tabBarInactiveTintColor: '#E5E4E2', 
          tabBarShowLabel: true, 
          headerShown: false, 

          tabBarStyle: {
            paddingBottom:'3%',
            position: 'absolute',
            bottom: 20, 
            left: 10, 
            right: 10, 
            backgroundColor: Colors[colorScheme ?? 'light'].background, 
            borderRadius: 30, 
            height: '8%', 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 10 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 5, 
            elevation: 10,
          },
          tabBarItemStyle:{
            flex:1,
            flexDirection:'column',

          },
          tabBarLabelStyle: {
            fontSize: 12, 
          },
          tabBarIconStyle: {
            paddingHorizontal:0,
            paddingVertical:0,
          },
          
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Habit Tracker', 
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="focustimer"
          options={{
            title: 'Focus Timer', 
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'timer' : 'timer-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Task Tracker', 
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
    </AuthProvider>
  );
}
