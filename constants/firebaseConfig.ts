import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// YOUR WEB APP CONFIGURATION GOES HERE
const firebaseConfig = {
    apiKey: "AIzaSyAYPSVWLDjthitZTWJ7SA5WeXUdNEU6Was",
    authDomain: "dawat-26b66.firebaseapp.com",
    projectId: "dawat-26b66",
    storageBucket: "dawat-26b66.firebasestorage.app",
    messagingSenderId: "115934389920",
    appId: "1:115934389920:android:ec3b1fe8f26db7303e8bc5"
};

// Initialize Firebase
let app;
let auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth, app };
