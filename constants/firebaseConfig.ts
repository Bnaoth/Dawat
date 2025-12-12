import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// YOUR WEB APP CONFIGURATION GOES HERE
const firebaseConfig = {
    apiKey: "AIzaSyCF6y93b6ch3SBhuNg2JXlGfLUk_lGroxU",
    authDomain: "dawat-26b66.firebaseapp.com",
    projectId: "dawat-26b66",
    storageBucket: "dawat-26b66.firebasestorage.app",
    messagingSenderId: "115934389920",
    appId: "1:115934389920:web:6134df3498f8280e3e8bc5"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    try {
        const { getReactNativePersistence } = require("firebase/auth");
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch {
        // Fallback if getReactNativePersistence is not available
        auth = initializeAuth(app);
    }
} else {
    app = getApp();
    auth = getAuth(app);
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth, app };
