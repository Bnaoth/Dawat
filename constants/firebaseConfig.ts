import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// YOUR WEB APP CONFIGURATION GOES HERE
const firebaseConfig = {
    apiKey: "AIzaSyBgwARYICOoYFEOINgu6bfwKmxIDsHbFN4", // iOS/web key
    authDomain: "dawat-26b66.firebaseapp.com",
    projectId: "dawat-26b66",
    storageBucket: "dawat-26b66.firebasestorage.app",
    messagingSenderId: "115934389920",
    appId: "1:115934389920:ios:0d9a028673d1e32c3e8bc5"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app);
} else {
    app = getApp();
    auth = getAuth(app);
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth, app };
