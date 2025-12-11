import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, Auth } from "firebase/auth";
import { auth, db } from "../../constants/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import axios from "axios";

interface Address {
    postcode: string;
    street: string;
    city: string;
    county: string;
    full: string;
}

const UK_COUNTIES = [
    "Avon", "Bedfordshire", "Berkshire", "Buckinghamshire", "Cambridgeshire",
    "Cheshire", "Cleveland", "Cornwall", "Cumbria", "Derbyshire", "Devon",
    "Dorset", "Durham", "East Riding of Yorkshire", "East Sussex", "Essex",
    "Gloucestershire", "Greater London", "Greater Manchester", "Hampshire",
    "Hereford and Worcester", "Hertfordshire", "Humberside", "Isle of Wight",
    "Isles of Scilly", "Kent", "Lancashire", "Leicestershire", "Lincolnshire",
    "Merseyside", "Mid Glamorgan", "Norfolk", "North Yorkshire", "Northamptonshire",
    "Northumberland", "Nottinghamshire", "Oxfordshire", "Powys", "Rutland",
    "Salop", "Somerset", "South Glamorgan", "South Yorkshire", "Staffordshire",
    "Suffolk", "Surrey", "Tyne and Wear", "Warwickshire", "West Glamorgan",
    "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire",
    "Yorkshire",
].sort();

export default function RegisterScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [lookingUpPostcode, setLookingUpPostcode] = useState(false);

    // Form state - Postcode first
    const [postcode, setPostcode] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<Address[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [county, setCounty] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    // Manual entry flow: postcode lookup disabled (user enters all address fields)
    const lookupPostcode = async () => {
        // Intentionally no-op to keep manual entry simple
        return;
    };

    // Password validation
    const validatePassword = (pwd: string) => {
        const minLength = pwd.length >= 6;
        const hasLetter = /[a-zA-Z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);

        return { minLength, hasLetter, hasNumber };
    };

    const passwordValidation = validatePassword(password);
    const passwordMatch = password === confirmPassword && password.length > 0;
    const isPasswordValid =
        passwordValidation.minLength &&
        passwordValidation.hasLetter &&
        passwordValidation.hasNumber &&
        passwordMatch;

    const isEmailValid = email === confirmEmail && email.includes("@");
    const isPhoneValid = /^\d{10,}$/.test(mobileNumber.replace(/\D/g, ""));

    const handleRegister = async () => {
        // Validation
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Error", "Please enter first and last name");
            return;
        }

        if (!isEmailValid) {
            Alert.alert("Error", "Email addresses don't match or are invalid");
            return;
        }

        if (!isPasswordValid) {
            Alert.alert("Error", "Password doesn't meet requirements");
            return;
        }

        if (!address.trim() || !city.trim() || !county || !postcode.trim()) {
            Alert.alert("Error", "Please fill in all address fields");
            return;
        }

        if (!isPhoneValid) {
            Alert.alert("Error", "Please enter a valid mobile number");
            return;
        }

        setLoading(true);

        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                address: address,
                city: city,
                county: county,
                postcode: postcode,
                mobileNumber: mobileNumber,
                createdAt: new Date().toISOString(),
                uid: user.uid,
            });

            Alert.alert("Success", "Account created! Please log in to continue.", [
                {
                    text: "OK",
                    onPress: () => {
                        router.replace("/(auth)/login");
                    },
                },
            ]);
        } catch (error: any) {
            console.error("Registration error:", error);
            let errorMessage = "Registration failed. Please try again.";

            if (error.code === "auth/email-already-in-use") {
                errorMessage = "This email is already registered.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            }

            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="bg-orange-50 p-6 pb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mb-4"
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Create a new account</Text>
                    <Text className="text-gray-600 text-sm">Join our community of food lovers</Text>
                </View>

                <View className="p-6 pb-10">
                    {/* Email Section - FIRST */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-semibold mb-2">
                            Email <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 mb-4"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">
                            Confirm Email <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                            placeholder="Re-enter your email"
                            value={confirmEmail}
                            onChangeText={setConfirmEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                        {email && !isEmailValid && (
                            <Text className="text-red-500 text-sm mt-2">Emails don't match</Text>
                        )}
                    </View>

                    {/* Name Section */}
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-gray-700 font-semibold mb-2">
                                First Name <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                placeholder="Ganesh"
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={!loading}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 font-semibold mb-2">
                                Last Name <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                placeholder="Banoth"
                                value={lastName}
                                onChangeText={setLastName}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Password Section */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-semibold mb-2">
                            Create Password <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 mb-4"
                            placeholder="Enter password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />

                        <Text className="text-gray-700 font-semibold mb-2">
                            Confirm Password <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!loading}
                        />

                        {/* Password validation checklist */}
                        {password && (
                            <View className="mt-4 bg-orange-50 p-4 rounded-lg">
                                <View className="gap-2">
                                    <PasswordCheck label="Minimum 6 characters" valid={passwordValidation.minLength} />
                                    <PasswordCheck label="At least one letter" valid={passwordValidation.hasLetter} />
                                    <PasswordCheck label="At least one number" valid={passwordValidation.hasNumber} />
                                    <PasswordCheck label="Passwords match" valid={passwordMatch} />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Postcode Section (manual entry) */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-semibold mb-2">
                            UK Postcode <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                            placeholder="e.g., SW1A 1AA"
                            value={postcode}
                            onChangeText={(text) => {
                                setPostcode(text.toUpperCase());
                            }}
                            editable={!loading}
                            maxLength={8}
                        />
                    </View>

                    {/* Address Section - Manual entry */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-semibold mb-2">
                            Street Address <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                            placeholder="Home address"
                            value={address}
                            onChangeText={setAddress}
                            editable={!loading}
                        />
                    </View>

                    {/* City and County Section */}
                    <View className="mb-8">
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 font-semibold mb-2">
                                    City <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                    placeholder="City"
                                    value={city}
                                    onChangeText={setCity}
                                    editable={!loading}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-700 font-semibold mb-2">
                                    County <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                    placeholder="County"
                                    value={county}
                                    onChangeText={setCounty}
                                    editable={!loading}
                                />
                            </View>
                        </View>
                        <View>
                            <Text className="text-gray-700 font-semibold mb-2">
                                Country <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                placeholder="UK"
                                value={"UK"}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Mobile Section */}
                    <View className="mb-8">
                        <Text className="text-gray-700 font-semibold mb-2">
                            Mobile Number <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="flex-row gap-2">
                            <View className="bg-gray-50 border border-gray-300 rounded-xl p-4 justify-center">
                                <Text className="text-gray-700 font-medium">+44</Text>
                            </View>
                            <TextInput
                                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900"
                                placeholder="7551019728"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                        </View>
                        {mobileNumber && !isPhoneValid && (
                            <Text className="text-red-500 text-sm mt-2">Please enter a valid phone number</Text>
                        )}
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={
                            loading ||
                            !isPasswordValid ||
                            !isEmailValid ||
                            !firstName ||
                            !lastName ||
                            !address ||
                            !city ||
                            !county ||
                            !postcode ||
                            !isPhoneValid
                        }
                        className={`rounded-xl p-4 items-center ${
                            loading ||
                            !isPasswordValid ||
                            !isEmailValid ||
                            !firstName ||
                            !lastName ||
                            !address ||
                            !city ||
                            !county ||
                            !postcode ||
                            !isPhoneValid
                                ? "bg-gray-300"
                                : "bg-orange-600"
                        }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View className="mt-6 flex-row justify-center gap-1">
                        <Text className="text-gray-600">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/(auth)/login")} disabled={loading}>
                            <Text className="text-orange-600 font-bold">Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}

function PasswordCheck({ label, valid }: { label: string; valid: boolean }) {
    return (
        <View className="flex-row items-center gap-2">
            <Ionicons
                name={valid ? "checkmark-circle" : "close-circle"}
                size={20}
                color={valid ? "#10B981" : "#EF4444"}
            />
            <Text className={valid ? "text-green-600" : "text-red-600"}>{label}</Text>
        </View>
    );
}
