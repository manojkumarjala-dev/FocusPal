import React, { useContext } from 'react';
import { Image, StyleSheet, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Router } from 'expo-router';
import { AuthContext } from '@/AuthProvider';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  
  return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>FocusPal</Text>
          <Text style={styles.tagline}>Master your time, build great habits.</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <Image source={require('@/assets/images/focus.png')} style={styles.illustration} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.navigate('/login')} // Navigate to Login when pressed
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.navigate('/signup')} // Navigate to SignUp when pressed
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00796b', // Dark teal color for the app name
  },
  tagline: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  illustration: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row', // Make the buttons sit side by side
    justifyContent: 'space-between', // Add space between the buttons
    marginTop: 30,
    width: '100%',
  },
  button: {
    flex: 1, // Make both buttons take equal width
    backgroundColor: '#00796b', // Button background color
    paddingVertical: 15,
    marginHorizontal: 10, // Adds spacing between buttons
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});