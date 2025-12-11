import { View, Text, Image, TouchableOpacity, ScrollView, Alert, FlatList, Dimensions, Animated } from "react-native";
import { useGlobalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper to resolve image source from params (handling require vs uri string)
const resolveImage = (imgParam: string | any) => {
    if (!imgParam) return { uri: 'https://placehold.co/600x400' };
    if (!isNaN(Number(imgParam))) {
        return Number(imgParam);
    }
    return { uri: imgParam };
};

export default function FoodDetailScreen() {

    const params = useGlobalSearchParams();

    const { id, title, chef, price, image, maxQuantity = "10", ingredients } = params;

    // Parse price (remove currency symbol)
    const numericPrice = parseFloat((price as string).replace('£', ''));

    // Ensure maxQty is a valid number
    const DEFAULT_MAX = 10;
    let parsedMax = parseInt(maxQuantity as string, 10);
    const maxQty = isNaN(parsedMax) ? DEFAULT_MAX : parsedMax;

    const [quantity, setQuantity] = useState(1);
    const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    // Use local assets as requested by user
    const carouselImages = [
        require('../../assets/food/img1.png'),
        require('../../assets/food/img2.png'),
        require('../../assets/food/img3.png'),
        require('../../assets/food/img4.png')
    ];

    const ingredientsList = ingredients ? JSON.parse(ingredients as string) : [
        "Fresh Basmati Rice", "Organic Chicken Breast", "Saffron" // Fallback
    ];

    // Calculations
    const totalAmount = numericPrice * quantity;
    const adminShare = totalAmount * 0.10; // 10%
    const chefShare = totalAmount * 0.90;  // 90%

    const handleCheckout = () => {
        Alert.alert(
            "Confirm Order",
            `Pay £${totalAmount.toFixed(2)} for ${quantity} items?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Pay Now",
                    onPress: () => {
                        Alert.alert("Success", "Order placed! Enjoy your Dawat.");
                        router.back();
                    }
                }
            ]
        );
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveSlide(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header with Back Button */}
            <View className="absolute top-12 left-4 z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/90 p-2 rounded-full shadow-sm"
                >
                    <Ionicons name="arrow-back" size={24} color="#EA580C" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View className="relative">
                    <FlatList
                        data={carouselImages}
                        renderItem={({ item }) => (
                            <Image
                                source={item}
                                style={{ width: SCREEN_WIDTH, height: 320 }}
                                resizeMode="cover"
                            />
                        )}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        keyExtractor={(_, index) => index.toString()}
                    />

                </View>

                <View className="p-6 -mt-6 bg-white rounded-t-3xl shadow-lg">
                    {/* Pagination Dots (Moved here for visibility) */}
                    <View className="flex-row justify-center items-center space-x-2 mb-6">
                        {carouselImages.map((_, index) => (
                            <View
                                key={index}
                                className={`rounded-full ${index === activeSlide ? 'w-5 h-2.5 bg-red-600' : 'w-2 h-2 bg-red-300'}`}
                            />
                        ))}
                    </View>

                    {/* Title & Price */}
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                            <Text className="text-2xl font-bold text-gray-900 leading-tight">{title}</Text>
                            <Text className="text-gray-500 font-medium mt-1">by Chef {chef}</Text>
                        </View>
                        <Text className="text-2xl font-bold text-orange-600">£{numericPrice}</Text>
                    </View>

                    {/* Ingredients Section */}
                    <View className="mt-6 mb-2 border border-gray-100 rounded-xl overflow-hidden">
                        <TouchableOpacity
                            onPress={() => setIngredientsExpanded(!ingredientsExpanded)}
                            className="flex-row justify-between items-center p-4 bg-gray-50"
                        >
                            <Text className="text-lg font-bold text-gray-800">Ingredients</Text>
                            <Ionicons
                                name={ingredientsExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#4B5563"
                            />
                        </TouchableOpacity>

                        {ingredientsExpanded && (
                            <View className="p-4 bg-white">
                                <View className="flex-row flex-wrap gap-2">
                                    {ingredientsList.map((ingredient: string, index: number) => (
                                        <View key={index} className="bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                                            <Text className="text-orange-800 text-sm font-medium">{ingredient}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="h-px bg-gray-100 my-6" />

                    {/* Quantity Selector */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-gray-800">Select Quantity</Text>
                            <Text className="text-orange-600 font-bold text-xl">{quantity}</Text>
                        </View>

                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={maxQty}
                            step={1}
                            value={quantity}
                            onValueChange={setQuantity}
                            minimumTrackTintColor="#EA580C"
                            maximumTrackTintColor="#D1D5DB"
                            thumbTintColor="#EA580C"
                        />
                        <Text className="text-center text-gray-400 text-xs mt-2">Available: {maxQty} portions</Text>
                    </View>

                    {/* Bill Breakdown */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
                        <Text className="text-sm font-bold text-gray-900 mb-3">Payment Breakdown</Text>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Total Price</Text>
                            <Text className="font-bold text-gray-900">£{totalAmount.toFixed(2)}</Text>
                        </View>
                        <View className="h-px bg-gray-200 my-2" />

                        {/* Visual Split for User Knowledge (as requested) */}
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="restaurant" size={12} color="#16A34A" />
                                <Text className="text-xs text-green-700">Chef receives (90%)</Text>
                            </View>
                            <Text className="text-xs font-bold text-green-700">£{chefShare.toFixed(2)}</Text>
                        </View>

                        <View className="flex-row justify-between items-center mt-1">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="shield-checkmark" size={12} color="#6B7280" />
                                <Text className="text-xs text-gray-500">Platform fee (10%)</Text>
                            </View>
                            <Text className="text-xs font-bold text-gray-500">£{adminShare.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Checkout Button */}
                    <TouchableOpacity
                        onPress={handleCheckout}
                        className="w-full bg-orange-600 py-4 rounded-xl items-center shadow-md active:bg-orange-700"
                    >
                        <Text className="text-white font-bold text-xl">Checkout • £{totalAmount.toFixed(2)}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
