import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-6 items-center border-b border-gray-100">
                <Image
                    source={require("../../assets/images/profile.png")}
                    className="w-24 h-24 rounded-full mb-3"
                />
                <Text className="text-xl font-bold text-gray-900">B Ganesh</Text>
                <Text className="text-gray-500">London, UK</Text>
            </View>

            <ScrollView className="p-4">
                <View className="bg-white rounded-xl overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
                        <View className="bg-orange-100 p-2 rounded-full mr-3">
                            <Ionicons name="receipt-outline" size={20} color="#EA580C" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Order History</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
                        <View className="bg-blue-100 p-2 rounded-full mr-3">
                            <Ionicons name="card-outline" size={20} color="#2563EB" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4">
                        <View className="bg-gray-100 p-2 rounded-full mr-3">
                            <Ionicons name="settings-outline" size={20} color="#4B5563" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="bg-red-50 p-4 rounded-xl items-center">
                    <Text className="text-red-600 font-bold">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
