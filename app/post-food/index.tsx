import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";

const CATEGORIES = [
    { id: '1', name: 'Chicken Biryani', icon: '🍗' },
    { id: '2', name: 'Mutton Biryani', icon: '🥩' },
    { id: '3', name: 'Veg Biryani', icon: '🥕' },
    { id: '4', name: 'Egg Biryani', icon: '🥚' },
    { id: '5', name: 'Prawns Biryani', icon: '🍤' },
    { id: '6', name: 'Fish Biryani', icon: '🐟' },
];

export default function CategoryScreen() {
    const router = useRouter();

    const handleSelect = (category: string) => {
        router.push({ pathname: "/post-food/ingredients", params: { category } });
    };

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-gray-500 mb-4">What are you cooking today?</Text>
            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelect(item.name)}
                        className="w-[48%] bg-orange-50 p-6 rounded-2xl mb-4 items-center justify-center border border-orange-100"
                    >
                        <Text className="text-4xl mb-2">{item.icon}</Text>
                        <Text className="text-gray-900 font-bold text-center">{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
