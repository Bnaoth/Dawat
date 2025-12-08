import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FoodCard from "../../components/FoodCard";

const MOCK_DATA = [
    {
        id: '1',
        title: 'Hyderabadi Chicken Dum Biryani',
        chef: 'Amina Begum',
        distance: '0.8 miles',
        price: '£8.50',
        // User Uploaded Image
        image: require('../../assets/images/chicken_biryani.jpg'),
        rating: 4.9
    },
    {
        id: '2',
        title: 'Homemade Mutton Biryani',
        chef: 'Raju Kitchen',
        distance: '1.2 miles',
        price: '£10.00',
        // Wikimedia Commons - Mutton/Meat Biryani replacement
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Biryani_of_Lahore.jpg/800px-Biryani_of_Lahore.jpg',
        rating: 4.7
    },
    {
        id: '3',
        title: 'Paneer 65 & Veg Biryani',
        chef: 'Sita Home Foods',
        distance: '0.5 miles',
        price: '£7.00',
        // Wikimedia Commons - Veg/Biryani generic
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Biryani_Home.jpg/800px-Biryani_Home.jpg',
        rating: 4.5
    },
];

export default function HomeScreen() {
    const router = useRouter();
    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4 pb-0">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-500 text-sm font-medium">Location</Text>
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xl font-bold text-gray-900">London, UK</Text>
                        <Ionicons name="chevron-down" size={16} color="black" />
                    </View>
                </View>
                <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
                    <Ionicons name="notifications-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">Near You (2 Miles)</Text>
                <Text className="text-orange-600 font-medium text-sm">See all</Text>
            </View>

            <FlatList
                data={MOCK_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <FoodCard
                        title={item.title}
                        chef={item.chef}
                        distance={item.distance}
                        price={item.price}
                        image={item.image}
                        rating={item.rating}
                        onPress={() => {

                            // Handle passing local asset (number) vs remote URL (string) to params
                            let imageParam = item.image;
                            if (typeof item.image === 'number') {
                                imageParam = item.image.toString();
                            }

                            router.push({
                                pathname: "/food-detail/[id]",
                                params: {
                                    id: item.id,
                                    title: item.title,
                                    chef: item.chef,
                                    price: item.price,
                                    image: imageParam,
                                    maxQuantity: "10" // Mock availability
                                }
                            });
                        }}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
        </SafeAreaView>
    );
}
