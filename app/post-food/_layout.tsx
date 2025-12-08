import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PostFoodLayout() {
    const router = useRouter();

    return (
        <Stack screenOptions={{
            headerShown: true,
            headerTintColor: '#EA580C',
            headerTitleStyle: { fontWeight: 'bold' },
        }}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Select Category",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#EA580C" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen name="ingredients" options={{ title: "Ingredients" }} />
            <Stack.Screen name="upload" options={{ title: "Upload Photos" }} />
        </Stack>
    );
}
