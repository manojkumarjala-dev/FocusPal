import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth'; // Firebase Authentication
import { useRouter } from 'expo-router'; // To handle navigation
import { useNavigation } from 'expo-router';

const SignOutScreen = () => {
  const auth = getAuth();
  const router = useRouter(); // To navigate after sign-out
    const navigate=useNavigation();
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully');
        router.navigate('/');
      })
      .catch((error) => {
        console.error('Error signing out:', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Out</Text>
      <Text style={styles.text}>Are you sure you want to sign out?</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default SignOutScreen;
