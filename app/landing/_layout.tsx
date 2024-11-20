import { Redirect, Stack, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { Text, View, ActivityIndicator, Button } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/firebaseConfig';
import { ThemeProvider } from '@react-navigation/native';
import Drawer from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged, User } from 'firebase/auth'; // Ensure this import is included
import { SafeAreaView, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Manage the authenticated user state
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false); // Stop loading once we know the auth state
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Display a loading indicator while checking the authentication status
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to login if the user is not authenticated
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        
      
      <GestureHandlerRootView>
        <Drawer>
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: 'Home',
              headerTitle: '',      
              headerShown: true,    
            }}
          />
          <Drawer.Screen
            name="signout/index"
            options={{
              title: 'Sign Out',
              headerTitle: '',      
              headerShown: true,    
            }}
          />
          
        </Drawer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Match your app's background color
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

