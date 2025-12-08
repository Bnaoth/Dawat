import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";

export default function UploadScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);

    const pickImage = async () => {
        // Request permission mock (Expo handles usually)
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const handleSubmit = () => {
        if (images.length === 0) {
            Alert.alert("No Photos?", "Please add at least one photo of your delicious food!");
            return;
        }

        Alert.alert(
            "Success!",
            "Your Biryani is now live! Neighbors within 2 miles have been notified.",
            [
                { text: "Awesome", onPress: () => router.replace("/(tabs)/kitchen") }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white p-4">
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

            <TouchableOpacity
                onPress={handleSubmit}
                className={`w-full rounded-xl p-4 items-center shadow-sm ${images.length > 0 ? 'bg-orange-600' : 'bg-gray-300'}`}
                disabled={images.length === 0}
            >
                <Text className="text-white font-bold text-lg">Post Food</Text>
            </TouchableOpacity>
        </View>
    );
}
