import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const handleLogin = () => {
        // Mock validation
        if (email.length > 3) {
            router.push({ pathname: "/(auth)/otp", params: { email } });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="items-center mb-10">
                <View className="h-24 w-24 bg-orange-100 rounded-full items-center justify-center mb-4">
                    {/* Placeholder for Logo */}
                    <Text className="text-4xl">🍲</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-900">Dawat</Text>
                <Text className="text-gray-500 mt-2">Authentic community food sharing</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                    <TextInput
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                        placeholder="enter your email..."
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    className="w-full bg-orange-600 rounded-xl p-4 items-center shadow-sm active:bg-orange-700"
                >
                    <Text className="text-white font-bold text-lg">Send OTP</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
