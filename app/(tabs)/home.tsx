import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FoodCard from "../../components/FoodCard";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchPosts, Post } from "../../store/slices/feedSlice";

export default function HomeScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.feed);
    const { location } = useSelector((state: RootState) => state.user);

    // useEffect(() => {
    //     dispatch(fetchPosts());
    // }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchPosts());
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4 pb-0">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-500 text-sm font-medium">Location</Text>
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xl font-bold text-gray-900">{location}</Text>
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
                data={posts}
                keyExtractor={(item) => item.id || Math.random().toString()}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-400">No delicious food nearby yet...</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <FoodCard
                        title={item.title}
                        chef={item.chef}
                        distance={item.distance}
                        price={item.price}
                        image={item.image}
                        rating={item.rating}
                        onPress={() => {
                            router.push({
                                pathname: "/food-detail/[id]",
                                params: {
                                    id: item.id,
                                    title: item.title,
                                    chef: item.chef,
                                    price: item.price,
                                    image: item.image,
                                    allImages: JSON.stringify(item.allImages),
                                    ingredients: JSON.stringify(item.ingredients || []),
                                    maxQuantity: item.quantity
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
