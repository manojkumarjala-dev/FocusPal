import { Redirect, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/firebaseConfig';
import { ThemeProvider } from 'react-native-paper';
import Nav from '@/app/signout/Nav';

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Redirect to login if the user is not authenticated
  if (!auth.currentUser) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* <View style={{flex:0.7}}>

        <Nav ></Nav>
        </View> */}
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true, // Enable header
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Habit tracker', // Explicitly set the header title for this tab
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Pomodoro Timer', // Explicitly set the header title for this tab
        }}
      />
      <Tabs.Screen
        name="habit"
        options={{
          title: 'Task Tracker', // Explicitly set the header title for this tab
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </ThemeProvider>
  );
}
