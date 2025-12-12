import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../constants/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser } from "../../store/slices/userSlice";
export default function LoginScreen() {
    const devBypassEmail = "rathod4b3@gmail.com";
    const devBypassPassword = "Aadhya@123";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const isEmailValid = email.includes("@");
    const isPasswordValid = password.length >= 6;

    const saveUserDataLocally = async (uid: string) => {
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as any;
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                await AsyncStorage.setItem("userId", uid);
                dispatch(
                    setReduxUser({
                        firstName: userData.firstName || "",
                        lastName: userData.lastName || "",
                        postcode: userData.postcode || "",
                        address: userData.address || "",
                        city: userData.city || "",
                        county: userData.county || "",
                        name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
                        location: userData.address || userData.city,
                        avatar: userData.avatar || "profile.png",
                    })
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error saving user data locally:", error);
            return false;
        }
    };

    const handleLogin = async () => {
        if (!isEmailValid || !isPasswordValid) {
            Alert.alert("Error", "Please enter valid email and password");
            return;
        }

        if (email === devBypassEmail && password === devBypassPassword) {
            setLoading(true);
            try {
                const mockUser = {
                    uid: "dev_user_123",
                    email: devBypassEmail,
                    firstName: "Dev",
                    lastName: "User",
                    fullName: "Dev User",
                    postcode: "SW1A 1AA",
                    address: "123 Test Street",
                    city: "London",
                    county: "Greater London",
                    mobileNumber: "01234567890",
                    createdAt: new Date().toISOString(),
                };

                

                await AsyncStorage.setItem("user", JSON.stringify(mockUser));
                await AsyncStorage.setItem("userId", mockUser.uid);

                dispatch(
                    setReduxUser({
                        firstName: mockUser.firstName,
                        lastName: mockUser.lastName,
                        postcode: mockUser.postcode,
                        address: mockUser.address,
                        city: mockUser.city,
                        county: mockUser.county,
                        name: mockUser.fullName,
                        location: mockUser.address,
                        avatar: "profile.png",
                    })
                );

                router.replace("/(tabs)/home");
            } catch (error) {
                console.error("Bypass login error:", error);
                Alert.alert("Error", "Failed to access dashboard");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            const savedSuccessfully = await saveUserDataLocally(uid);
            if (savedSuccessfully) {
                Alert.alert("Success", "Logged in successfully!");
                router.replace("/(tabs)/home");
            } else {
                Alert.alert("Error", "User data not found. Please contact support.");
                await auth.signOut();
            }
        } catch (error: any) {
            console.error("Login error:", error);
            let errorMessage = "Login failed. Please try again.";
            if (error.code === "auth/user-not-found") errorMessage = "No account found with this email.";
            else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password.";
            else if (error.code === "auth/invalid-email") errorMessage = "Invalid email address.";
            else if (error.code === "auth/user-disabled") errorMessage = "This account has been disabled.";
            else if (error.code === "auth/too-many-requests") errorMessage = "Too many failed login attempts. Please try again later.";
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-6 justify-between">
                <View className="items-center">
                    <TouchableOpacity onPress={() => router.back()} className="self-start mb-6">
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <View className="h-24 w-24 bg-orange-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-4xl">🍲</Text>
                    </View>
                    <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                    <Text className="text-gray-500 mt-2">Login to your Dawat account</Text>
                </View>

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
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
                                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading || !isEmailValid || !isPasswordValid}
                    className={`w-full rounded-xl p-4 items-center ${
                        loading || !isEmailValid || !isPasswordValid ? "bg-gray-300" : "bg-orange-600"
                    }`}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Log In</Text>}
                </TouchableOpacity>

                <View className="items-center gap-4">
                    <View className="flex-row gap-1">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/(auth)/register")} disabled={loading}>
                            <Text className="text-orange-600 font-bold">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
