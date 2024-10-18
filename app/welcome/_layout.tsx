import { Redirect, Stack, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import Nav from '../Nav';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/firebaseConfig';
import { ThemeProvider } from '@react-navigation/native';

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

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
