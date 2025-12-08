import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OTPScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState("");
    const router = useRouter();

    const handleVerify = () => {
        // Mock verification
        if (otp.length === 4) {
            // Navigate to main app and reset stack
            router.replace("/(tabs)/home");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="mt-10 mb-8">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Verification</Text>
                <Text className="text-gray-500">
                    We've sent a code to <Text className="font-bold text-gray-800">{email}</Text>
                </Text>
            </View>

            <View className="space-y-6">
                <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-3xl font-bold tracking-widest text-gray-900"
                    placeholder="0000"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                />

                <TouchableOpacity
                    onPress={handleVerify}
                    className="w-full bg-orange-600 rounded-xl p-4 items-center shadow-sm active:bg-orange-700"
                >
                    <Text className="text-white font-bold text-lg">Verify & Eat</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} className="items-center">
                    <Text className="text-orange-600 font-medium">Change Email</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
