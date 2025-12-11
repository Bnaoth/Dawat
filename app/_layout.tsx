import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../constants/firebaseConfig";

export default function RootLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        // You can show a splash screen here if desired
        return null;
    }

    return (
        <Provider store={store}>
            <Stack screenOptions={{ headerShown: false }}>
                {user ? (
                    // User is logged in - show app screens
                    <>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="food-detail/[id]" options={{ headerShown: false }} />
                        <Stack.Screen name="post-food" options={{ headerShown: false }} />
                    </>
                ) : (
                    // User is not logged in - show auth screens
                    <Stack.Screen name="(auth)" />
                )}
            </Stack>
            <StatusBar style="dark" />
        </Provider>
    );
}
