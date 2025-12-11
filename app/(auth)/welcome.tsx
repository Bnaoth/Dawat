import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <LinearGradient
                colors={['#92400e', '#b8860b', '#d4a574']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 justify-between p-6 pb-12"
            >
                {/* Top spacer */}
                <View className="flex-1" />

                {/* Center: Dawat Title and Subtitle */}
                <View className="items-center mb-16">
                    <Text className="text-6xl font-bold text-white mb-3">Dawat</Text>
                    <Text className="text-xl text-white/90 font-medium text-center">Takeout and Catering</Text>
                    <Text className="text-lg text-white/80 font-normal text-center mt-2">Authentic community food sharing</Text>
                </View>

                {/* Bottom: Buttons */}
                <View className="gap-4">
                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/login")}
                        className="w-full bg-white rounded-xl p-4 items-center shadow-lg"
                    >
                        <Text className="text-orange-600 font-bold text-lg">Log in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/register")}
                        className="w-full bg-transparent border-2 border-white rounded-xl p-4 items-center"
                    >
                        <Text className="text-white font-bold text-lg">Register</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
