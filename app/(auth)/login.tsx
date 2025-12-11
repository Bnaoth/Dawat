import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../constants/firebaseConfig";

export default function LoginScreen() {
    const devBypassEmail = "rathod4b3@gmail.com";
    const devBypassPassword = "Aadhya@123";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const isEmailValid = email.includes("@");
    const isPasswordValid = password.length >= 6;

    const handleLogin = async () => {
        if (!isEmailValid || !isPasswordValid) {
            Alert.alert("Error", "Please enter valid email and password");
            return;
        }

        // Temporary bypass to allow dashboard access with known credentials
        if (email === devBypassEmail && password === devBypassPassword) {
            setLoading(true);
            router.replace("/(tabs)/home");
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation will be handled by the auth state listener in root layout
        } catch (error: any) {
            console.error("Login error:", error);
            let errorMessage = "Login failed. Please try again.";

            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            } else if (error.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled.";
            }

            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-6 justify-between">
                {/* Header */}
                <View className="items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="self-start mb-6"
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>

                    <View className="h-24 w-24 bg-orange-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-4xl">🍲</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                    <Text className="text-gray-500 mt-2">Login to your Dawat account</Text>
                </View>

                {/* Form */}
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-semibold mb-2">Password</Text>
                        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl">
                            <TextInput
                                className="flex-1 p-4 text-gray-900"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="px-4"
                            >
                                <Ionicons
                                    name={showPassword ? "eye" : "eye-off"}
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading || !isEmailValid || !isPasswordValid}
                        className={`w-full rounded-xl p-4 items-center ${
                            loading || !isEmailValid || !isPasswordValid
                                ? "bg-gray-300"
                                : "bg-orange-600"
                        }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="items-center gap-4">
                    <View className="flex-row gap-1">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(auth)/register")}
                            disabled={loading}
                        >
                            <Text className="text-orange-600 font-bold">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
