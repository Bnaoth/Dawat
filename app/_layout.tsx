import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AuthProvider, useAuth } from "../context/AuthContext";
function RootLayoutContent() {
    const { isSignedIn, isLoading } = useAuth();

    if (isLoading) {
        // Show splash screen while loading
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isSignedIn ? (
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
    );
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <RootLayoutContent />
                <StatusBar style="dark" />
            </AuthProvider>
        </Provider>
    );
}
