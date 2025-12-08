import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function KitchenScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-900">My Kitchen</Text>
                <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Analytics Section */}
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Analytics</Text>
                <View className="flex-row justify-between">
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">12</Text>
                        <Text className="text-gray-500 text-xs">Today's Orders</Text>
                    </View>
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">£85</Text>
                        <Text className="text-gray-500 text-xs">Earnings</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-3xl font-bold text-orange-600">48</Text>
                        <Text className="text-gray-500 text-xs">Profile Views</Text>
                    </View>
                </View>
            </View>

            {/* Active Menu Section */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Active Menu</Text>
                <TouchableOpacity
                    onPress={() => router.push("/post-food")}
                    className="bg-orange-600 px-4 py-2 rounded-full flex-row items-center gap-1"
                >
                    <Ionicons name="add" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">Post Food</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Mock Active Item */}
                <View className="bg-white p-4 rounded-xl shadow-sm flex-row items-center mb-3">
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200" }}
                        className="w-16 h-16 rounded-lg mr-4"
                    />
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">Chicken Biryani</Text>
                        <Text className="text-sm text-gray-500">Remaining: 5 portions</Text>
                    </View>
                    <View className="bg-green-100 px-2 py-1 rounded-md">
                        <Text className="text-green-700 text-xs font-bold">Live</Text>
                    </View>
                </View>

                {/* Empty State Hint */}
                <View className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center mt-2">
                    <Text className="text-gray-400 text-center">Todays menu is almost empty. {"\n"}Post something tasty!</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
