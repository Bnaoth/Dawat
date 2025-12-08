import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodCardProps {
    title: string;
    chef: string;
    distance: string;
    price: string;
    image?: any; // Supports require() or { uri: string }
    rating?: number;
    onPress: () => void;
}

export default function FoodCard({ title, chef, distance, price, image, rating = 4.8, onPress }: FoodCardProps) {
    // Determine the image source safely
    let source;
    if (image) {
        source = typeof image === 'string' ? { uri: image } : image;
    } else {
        source = { uri: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop" };
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl mb-5 shadow-sm overflow-hidden"
        >
            <View className="h-48 bg-gray-200 w-full relative">
                <Image
                    source={source}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex-row items-center gap-1">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-xs font-bold text-gray-800">{rating}</Text>
                </View>
            </View>

            <View className="p-4">
                <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-1 mr-2">
                        <Text className="text-lg font-bold text-gray-900 leading-tight">{title}</Text>
                        <Text className="text-sm text-gray-500 font-medium">by {chef}</Text>
                    </View>
                    <Text className="text-lg font-bold text-orange-600">{price}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text className="text-xs text-gray-500">{distance} away</Text>
                    </View>
                    <TouchableOpacity className="bg-orange-600 px-4 py-2 rounded-full">
                        <Text className="text-white text-xs font-bold">Grab It</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}
