import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const INGREDIENTS = [
    "Basmati Rice", "Chicken/Mutton", "Yogurt (Curd)", "Fried Onions",
    "Ginger Garlic Paste", "Green Chillies", "Mint Leaves", "Coriander Leaves",
    "Desi Ghee", "Oil", "Salt", "Red Chilli Powder", "Turmeric Powder",
    "Biryani Masala", "Saffron", "Milk", "Lemon Juice", "Cloves",
    "Cardamom", "Cinnamon", "Bay Leaf", "Star Anise", "Shahi Jeera",
    "Kevin Water", "Rose Water"
];

export default function IngredientsScreen() {
    const { category } = useLocalSearchParams();
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggleIngredient = (item: string) => {
        if (selected.includes(item)) {
            setSelected(selected.filter(i => i !== item));
        } else {
            setSelected([...selected, item]);
        }
    };

    const handleNext = () => {
        router.push({
            pathname: "/post-food/upload",
            params: { category, ingredients: JSON.stringify(selected) }
        });
    };

    return (
        <View className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">{category}</Text>
                <Text className="text-gray-500">Select ingredients used (Optional)</Text>
            </View>

            <FlatList
                data={INGREDIENTS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                    const isSelected = selected.includes(item);
                    return (
                        <TouchableOpacity
                            onPress={() => toggleIngredient(item)}
                            className={`flex-row items-center justify-between p-4 border-b border-gray-50 ${isSelected ? 'bg-orange-50' : 'bg-white'}`}
                        >
                            <Text className={`text-base ${isSelected ? 'font-bold text-orange-900' : 'text-gray-700'}`}>{item}</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={24} color="#EA580C" />}
                            {!isSelected && <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleNext}
                    className="w-full bg-orange-600 rounded-xl p-4 items-center shadow-sm"
                >
                    <Text className="text-white font-bold text-lg">Next: Photos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
