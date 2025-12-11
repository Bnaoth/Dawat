import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from 'react-redux';
import { store } from '../store/store';

export default function RootLayout() {
    return (
        <Provider store={store}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="food-detail/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" />
        </Provider>
    );
}
