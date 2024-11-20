import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/AuthProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: true, 
            title: '',          
          }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{
            headerShown: true, 
            title: '',          
          }} 
        />
        <Stack.Screen 
          name="landing" 
          options={{
            headerShown: false,          
          }} 
        />
        <Stack.Screen 
          name="pages/timer" 
          options={{
            title:'',
            headerBackTitle:''
          }} 
        />
        <Stack.Screen 
          name="pages/addTask" 
          options={{
            title:'',
            headerBackTitle:'Tasks'
          }} 
        />
      
      <Stack.Screen 
          name="pages/habitPage/[id]" 
          options={{
            title:'',
            headerBackTitle:'Habits'
          }} 
        />
        </Stack>
    </ThemeProvider>
    </AuthProvider>
    
    </GestureHandlerRootView>
  );
}
