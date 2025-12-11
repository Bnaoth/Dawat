import { View, Text, TouchableOpacity, ScrollView, Image, Alert, TextInput, ActivityIndicator, Modal, FlatList, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addNewPost } from "../../store/slices/feedSlice";

const QUANTITY_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1));
const PRICE_OPTIONS = ["Free", ...Array.from({ length: 40 }, (_, i) => `£${(i + 1) * 0.50 ? ((i + 1) * 0.50).toFixed(2) : ""}`)];
// Generates "Free", "£0.50", "£1.00" ... up to £20.00

export default function UploadScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { loading } = useSelector((state: RootState) => state.feed);

    const [images, setImages] = useState<string[]>([]);
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("Free");

    // Manage which picker is open: 'quantity' | 'price' | null
    const [activePicker, setActivePicker] = useState<string | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            Alert.alert("No Photos?", "Please add at least one photo of your delicious food!");
            return;
        }

        try {
            const ingredientsList = params.ingredients ? JSON.parse(params.ingredients as string) : [];

            await dispatch(addNewPost({
                title: (params.category as string) || "Delicious Food",
                chef: "Ganesh",
                chefAvatar: user.avatar,
                distance: "0.2 miles",
                price: price, // Use selected price
                localImages: images,
                ingredients: ingredientsList,
                quantity: `${quantity} Plates`, // appending unit for display
                rating: 5.0,
                location: user.location
            })).unwrap();

            Alert.alert(
                "Success!",
                `Your ${params.category} (${quantity} Plates) is now live!`,
                [
                    { text: "Awesome", onPress: () => router.replace("/(tabs)/kitchen") }
                ]
            );

        } catch (error) {
            console.error("Post Creation Failed:", error);
            Alert.alert("Error", "Failed to create post. Please try again.");
        }
    };

    // Helper to render picker options based on active type
    const getPickerData = () => {
        if (activePicker === 'quantity') return QUANTITY_OPTIONS;
        if (activePicker === 'price') return PRICE_OPTIONS;
        return [];
    };

    const handleSelectOption = (item: string) => {
        if (activePicker === 'quantity') setQuantity(item);
        if (activePicker === 'price') setPrice(item);
        setActivePicker(null);
    };

    return (
        <View className="flex-1 bg-white p-4">

            {/* Top Section: Quantity and Price Pickers */}
            <View className="mb-8 mt-2 flex-row justify-between gap-4">

                {/* Quantity Picker */}
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-2">Quantity</Text>
                    <TouchableOpacity
                        onPress={() => setActivePicker('quantity')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        <Text className="text-gray-900 text-lg">{quantity}</Text>
                        <Ionicons name="chevron-down" size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Price Picker */}
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-2">Price</Text>
                    <TouchableOpacity
                        onPress={() => setActivePicker('price')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        <Text className="text-gray-900 text-lg">{price}</Text>
                        <Ionicons name="chevron-down" size={20} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Photo Upload Section */}
            <Text className="text-xl font-bold text-gray-900 mb-2">Show off your food</Text>
            <Text className="text-gray-500 mb-6">Upload up to 10 photos.</Text>

            <ScrollView horizontal className="flex-row mb-8" showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    onPress={pickImage}
                    className="w-32 h-32 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-4"
                >
                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs mt-2">Add Photo</Text>
                </TouchableOpacity>

                {images.map((uri, index) => (
                    <View key={index} className="relative mr-4">
                        <Image source={{ uri }} className="w-32 h-32 rounded-xl" />
                        <TouchableOpacity
                            onPress={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm"
                        >
                            <Ionicons name="close-circle" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View className="flex-1" />

            {/* 3. Post Button (Bottom) */}
            <TouchableOpacity
                onPress={handleSubmit}
                className={`w-full bg-orange-600 rounded-xl p-4 items-center justify-center shadow-sm mb-6 ${images.length === 0 || loading ? 'opacity-50' : ''}`}
                disabled={images.length === 0 || loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Post Food</Text>
                )}
            </TouchableOpacity>

            {/* Unified Picker Modal */}
            <Modal
                visible={activePicker !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActivePicker(null)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setActivePicker(null)}
                >
                    <View className="bg-white rounded-t-3xl h-1/2 p-4">
                        <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <Text className="text-lg font-bold text-gray-900">
                                Select {activePicker === 'quantity' ? 'Quantity' : 'Price'}
                            </Text>
                            <TouchableOpacity onPress={() => setActivePicker(null)}>
                                <Text className="text-orange-600 font-medium">Done</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={getPickerData()}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = (activePicker === 'quantity' && quantity === item) ||
                                    (activePicker === 'price' && price === item);
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleSelectOption(item)}
                                        className={`p-4 border-b border-gray-50 items-center ${isSelected ? 'bg-orange-50' : ''}`}
                                    >
                                        <Text className={`text-lg ${isSelected ? 'font-bold text-orange-600' : 'text-gray-800'}`}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
