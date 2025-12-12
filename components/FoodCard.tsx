import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodCardProps {
    title: string;
    chef: string;
    distance: string;
    price: string;
    image?: any; // Supports require() or { uri: string }
    rating?: number;
    postedAgo?: string;
    supplierRating?: number;
    avgResponseTime?: number;
    isFavorite?: boolean;
    onPress: () => void;
    onFavoriteToggle?: () => void;
}

export default function FoodCard({ title, chef, distance, price, image, rating = 4.8, postedAgo, supplierRating, avgResponseTime, isFavorite, onPress, onFavoriteToggle }: FoodCardProps) {
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
                {isFavorite && (
                    <View className="absolute top-3 left-3 bg-red-500 p-2 rounded-full">
                        <Ionicons name="heart" size={16} color="white" />
                    </View>
                )}
            </View>

            <View className="p-4">
                <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-1 mr-2">
                        <Text className="text-lg font-bold text-gray-900 leading-tight">{title}</Text>
                        <Text className="text-sm text-gray-500 font-medium">by {chef}</Text>
                    </View>
                    <TouchableOpacity onPress={onFavoriteToggle} className="ml-2">
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#EF4444" : "#9CA3AF"} />
                    </TouchableOpacity>
                </View>

                {(supplierRating !== undefined || avgResponseTime !== undefined) && (
                    <View className="flex-row items-center gap-2 mb-2">
                        {supplierRating !== undefined && (
                            <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                <Ionicons name="star" size={12} color="#3B82F6" />
                                <Text className="text-xs font-semibold text-blue-700">{supplierRating.toFixed(1)}</Text>
                            </View>
                        )}
                        {avgResponseTime !== undefined && (
                            <View className="flex-row items-center gap-1 bg-green-50 px-2 py-1 rounded">
                                <Ionicons name="time" size={12} color="#16A34A" />
                                <Text className="text-xs font-semibold text-green-700">{avgResponseTime}m</Text>
                            </View>
                        )}
                    </View>
                )}

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text className="text-xs text-gray-500">{distance} away</Text>
                        </View>
                        {postedAgo && (
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={16} color="#6B7280" />
                                <Text className="text-xs text-gray-500">{postedAgo}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity className="bg-orange-600 px-4 py-2 rounded-full">
                        <Text className="text-white text-xs font-bold">Grab It</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}
