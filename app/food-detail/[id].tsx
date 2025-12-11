import { View, Text, Image, TouchableOpacity, ScrollView, Alert, FlatList, Dimensions, Animated, Modal } from "react-native";
import { useGlobalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import Slider from '@react-native-community/slider';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { createOrder } from "../../store/slices/ordersSlice";
import { decreasePostQuantity } from "../../store/slices/feedSlice";

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
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { loading } = useSelector((state: RootState) => state.orders);

    const { id, title, chef, price, image, maxQuantity = "10", ingredients, supplierId = "supplier_123" } = params;

    // Parse price (remove currency symbol)
    const numericPrice = parseFloat((price as string).replace('£', ''));

    // Parse available quantity from maxQuantity param (e.g., "10 Plates" -> 10)
    const DEFAULT_MAX = 10;
    const maxQuantityStr = maxQuantity as string;
    let parsedMax = parseInt(maxQuantityStr.replace(/[^0-9]/g, ''), 10);
    const maxQty = isNaN(parsedMax) || parsedMax === 0 ? DEFAULT_MAX : parsedMax;

    const [quantity, setQuantity] = useState(1);
    const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [generatedPasscode, setGeneratedPasscode] = useState('');

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
    const subtotal = numericPrice * quantity;
    const platformFee = 0.30; // Flat 30p platform fee
    const totalAmount = subtotal; // Customer pays list price
    const chefShare = Math.max(0, subtotal - platformFee); // Deducted from chef

    const handleCheckout = async () => {
        // Validate quantity
        if (quantity > maxQty) {
            Alert.alert("Insufficient Stock", `Only ${maxQty} plates available. Please reduce your quantity.`);
            return;
        }

        try {
            const result = await dispatch(createOrder({
                customerId: user.firstName || "customer_123",
                customerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Customer",
                customerPostcode: user.postcode,
                supplierId: supplierId as string,
                supplierName: chef as string,
                postId: id as string,
                postTitle: title as string,
                quantity,
                pricePerItem: price as string,
            })).unwrap();

            // Decrease post quantity (auto-deletes if 0)
            dispatch(decreasePostQuantity({ 
                postId: id as string, 
                orderedQuantity: quantity 
            }));

            // Show passcode modal with generated code
            setGeneratedPasscode(result.passcode);
            setShowPasscodeModal(true);
        } catch (error) {
            Alert.alert("Error", "Failed to create order. Please try again.");
        }
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
                            <View className="flex-row items-center gap-2">
                                <Text className="text-orange-600 font-bold text-xl">{quantity}</Text>
                                {maxQty === 0 && (
                                    <View className="bg-red-100 px-3 py-1 rounded-full">
                                        <Text className="text-red-700 font-bold text-xs">SOLD OUT</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {maxQty > 0 ? (
                            <>
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
                                <Text className="text-center text-gray-400 text-xs mt-2">Available: {maxQty} plates</Text>
                            </>
                        ) : (
                            <View className="bg-gray-100 p-4 rounded-xl items-center">
                                <Ionicons name="alert-circle-outline" size={32} color="#6B7280" />
                                <Text className="text-gray-500 mt-2">This item is currently sold out</Text>
                            </View>
                        )}
                    </View>

                    {/* Bill Breakdown */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
                        <Text className="text-sm font-bold text-gray-900 mb-3">Payment Breakdown</Text>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Total Price</Text>
                            <Text className="font-bold text-gray-900">£{totalAmount.toFixed(2)}</Text>
                        </View>

                        <View className="h-px bg-gray-200 my-2" />

                        <Text className="text-xs text-gray-400 mb-2">How this is distributed:</Text>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="restaurant" size={12} color="#16A34A" />
                                <Text className="text-xs text-green-700">Chef (Net)</Text>
                            </View>
                            <Text className="text-xs font-bold text-green-700">£{chefShare.toFixed(2)}</Text>
                        </View>

                        <View className="flex-row justify-between items-center mt-1">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="shield-checkmark" size={12} color="#6B7280" />
                                <Text className="text-xs text-gray-500">Platform Fee</Text>
                            </View>
                            <Text className="text-xs font-bold text-gray-500">£{platformFee.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Checkout Button */}
                    <TouchableOpacity
                        onPress={handleCheckout}
                        disabled={loading || maxQty === 0}
                        className={`w-full py-4 rounded-xl items-center shadow-md ${
                            maxQty === 0 ? 'bg-gray-300' : 'bg-orange-600 active:bg-orange-700'
                        } ${loading ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-white font-bold text-xl">
                            {maxQty === 0 ? "Sold Out" : loading ? "Processing..." : `Checkout • £${totalAmount.toFixed(2)}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Passcode Modal */}
            <Modal
                visible={showPasscodeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPasscodeModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-3xl p-8 w-full max-w-sm">
                        <View className="items-center mb-6">
                            <View className="bg-green-100 p-4 rounded-full mb-4">
                                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</Text>
                            <Text className="text-gray-500 text-center">
                                Your order has been sent to {chef}
                            </Text>
                        </View>

                        <View className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 mb-6">
                            <Text className="text-gray-700 text-center text-sm mb-2 font-medium">
                                Collection Passcode
                            </Text>
                            <Text className="text-5xl font-bold text-orange-600 text-center tracking-widest">
                                {generatedPasscode}
                            </Text>
                            <Text className="text-gray-500 text-center text-xs mt-3">
                                Share this code when collecting your order
                            </Text>
                        </View>

                        <View className="bg-gray-50 p-4 rounded-xl mb-6">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="information-circle" size={16} color="#6B7280" />
                                <Text className="text-gray-700 font-semibold text-sm">Next Steps:</Text>
                            </View>
                            <Text className="text-gray-600 text-xs leading-5">
                                1. Wait for the chef to confirm order is ready{'\n'}
                                2. Go to pickup location: {user.location}{'\n'}
                                3. Provide passcode: {generatedPasscode}{'\n'}
                                4. Enjoy your meal!
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                setShowPasscodeModal(false);
                                router.back();
                            }}
                            className="bg-orange-600 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Got It!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
