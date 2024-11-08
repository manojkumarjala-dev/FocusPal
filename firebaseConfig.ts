// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDR_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Set Firebase log level to silent
setLogLevel('silent');

// Initialize Firestore using Firebase compat library
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();

// Export the necessary modules
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db };
