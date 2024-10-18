import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Redirect, router } from 'expo-router';
import { auth, signInWithEmailAndPassword } from '@/firebaseConfig';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = () => {
      if (!email || !password) {
        Alert.alert("Error", "Please enter both email and password");
        return;
      }
  
      console.log("Attempting to log in...");
  
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('User logged in successfully:');
          router.navigate('/welcome')

    })
    .catch((error) => {
      console.error('Login failed:', error.message);
      alert(error.message);
    });
    return;
  };
  if(auth.currentUser){
    return <Redirect href="/welcome"/>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <View style={{paddingHorizontal:'20%'}}>
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      </View>

      {/* Container for Sign Up link and text */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.navigate('/signup')}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 50,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00796b', // Dark teal color for the app name
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#00796b', // Matching the app's primary color
    paddingVertical: 10, // Reduced padding to make the button smaller
    paddingHorizontal: 60, // Make sure it has some width but not too large
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#757575', // Grey text for the "Don't have an account?"
  },
  linkText: {
    fontSize: 16,
    color: '#00796b', // Use the app's primary color for the link
    fontWeight: 'bold',
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
