import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { db } from '@/firebaseConfig'; // Ensure this points to your Firebase config
import { AuthContext } from '@/AuthProvider'; // Ensure AuthContext is correctly imported
import { useRouter } from 'expo-router'; // Use router for navigation
import { useFocusEffect } from '@react-navigation/native'; // To refetch data when screen is focused

export default function PomodoroWelcomeScreen() {
  const [focusSessions, setFocusSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Fetch the focus session count from Firestore
  const fetchFocusSessions = async () => {
    if (!user) return;

    try {
      const sessionQuery = db.collection('focusSessions').where('userId', '==', user.uid);
      const sessionSnapshot = await sessionQuery.get();

      if (!sessionSnapshot.empty) {
        const userSession = sessionSnapshot.docs[0]; // Assuming each user has only one session document
        setFocusSessions(userSession.data()?.count || 0); // Set the session count
      } else {
        setFocusSessions(0); // If no session document exists, set the count to 0
      }

      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Refetch session count when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchFocusSessions();
    }, [user]) // Depend on the `user` to ensure proper updates
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
    source={require('@/assets/images/habitt.webp')} // Ensure the correct path to your assets folder
    style={styles.backgroundImage}
  >
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Focus Timer</Text>
      <Text style={styles.sessionCount}>You have completed {focusSessions} focus sessions.</Text>

      <TouchableOpacity style={styles.startButton} onPress={() => router.navigate('/pages/timer')}>
        <Text style={styles.startButtonText}>Start your timer</Text>
      </TouchableOpacity>
    </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // Cover the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28, // Larger text for prominence
    fontWeight: 'bold',
    color: '#000000', // White text color
    marginBottom: 20,
  },
  sessionCount: {
    fontSize: 18,
    color: '#8C8C8C', // Subtle grey for secondary information
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#1DB954', // Bright green for action button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff', // White text for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#a5a5a5', // Subtle color for loading text
  },
});