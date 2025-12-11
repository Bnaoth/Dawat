import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FoodCard from "../../components/FoodCard";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchPosts, Post } from "../../store/slices/feedSlice";
import { setUserLocation } from "../../store/slices/userSlice";
import * as Location from "expo-location";
import { calculateDistance, geocodePostcode, formatDistance } from "../../utils/locationUtils";

type FilterType = 'nearest' | 'topRated' | 'bestValue';

export default function HomeScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.feed);
    const { location, userLat, userLng, locationLoaded } = useSelector((state: RootState) => state.user);
    const [postsWithDistance, setPostsWithDistance] = useState<Post[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('nearest');
    const [refreshing, setRefreshing] = useState(false);

    // Request location permission and get user's current location on mount
    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.warn("Location permission denied");
                    return;
                }

                // Get current user location
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                dispatch(
                    setUserLocation({
                        lat: currentLocation.coords.latitude,
                        lng: currentLocation.coords.longitude,
                    })
                );
            } catch (error) {
                console.error("Location error:", error);
            }
        };

        requestLocationPermission();
    }, [dispatch]);

    // Geocode supplier addresses and calculate distances
    useEffect(() => {
        const calculateDistances = async () => {
            if (!locationLoaded || userLat === null || userLng === null) {
                return; // User location not ready yet
            }

            const updatedPosts = posts.map((post) => {
                try {
                    // If supplier has pre-geocoded coordinates, use them to calculate distance
                    if (post.supplierLat !== undefined && post.supplierLng !== undefined) {
                        const distance = calculateDistance(
                            userLat,
                            userLng,
                            post.supplierLat,
                            post.supplierLng
                        );
                        return {
                            ...post,
                            distance: formatDistance(distance),
                        };
                    }

                    // If no supplier coords, keep original distance
                    return post;
                } catch (error) {
                    console.error("Distance calculation error:", error);
                    return post;
                }
            });

            setPostsWithDistance(updatedPosts);
        };

        calculateDistances();
    }, [posts, locationLoaded, userLat, userLng]);

    // Sort posts based on active filter
    const sortedPosts = [...postsWithDistance].sort((a, b) => {
        if (activeFilter === 'nearest') {
            const distA = parseFloat(a.distance.replace(/[^0-9.]/g, '')) || 999;
            const distB = parseFloat(b.distance.replace(/[^0-9.]/g, '')) || 999;
            return distA - distB;
        } else if (activeFilter === 'topRated') {
            return b.rating - a.rating;
        } else {
            // bestValue: combination of low distance + high rating
            const distA = parseFloat(a.distance.replace(/[^0-9.]/g, '')) || 999;
            const distB = parseFloat(b.distance.replace(/[^0-9.]/g, '')) || 999;
            const scoreA = a.rating * 2 - distA;
            const scoreB = b.rating * 2 - distB;
            return scoreB - scoreA;
        }
    });

    // useEffect(() => {
    //     dispatch(fetchPosts());
    // }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        
        try {
            // Fetch fresh posts from Firebase
            await dispatch(fetchPosts()).unwrap();
            
            // Filter out posts older than 4-6 hours (using 5 hours as threshold)
            const HOURS_THRESHOLD = 5;
            const now = Date.now();
            const thresholdTime = now - (HOURS_THRESHOLD * 60 * 60 * 1000);
            
            // This filtering happens in the Redux state after fetch
            // The posts in state will already include new ones
            // We just need to show a success message
            
        } catch (error) {
            console.error("Refresh error:", error);
            Alert.alert("Refresh Failed", "Could not fetch latest food items");
        } finally {
            setRefreshing(false);
        }
    };

    const FilterChip = ({ label, value }: { label: string; value: FilterType }) => (
        <TouchableOpacity
            onPress={() => setActiveFilter(value)}
            className={`px-4 py-2 rounded-full mr-3 ${
                activeFilter === value ? 'bg-orange-600' : 'bg-white border border-gray-200'
            }`}
        >
            <Text className={`font-semibold ${activeFilter === value ? 'text-white' : 'text-gray-700'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

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
                <Text className="text-lg font-bold text-gray-800">
                    {activeFilter === 'nearest' && 'Nearest to You'}
                    {activeFilter === 'topRated' && 'Top Rated'}
                    {activeFilter === 'bestValue' && 'Best Value'}
                </Text>
                <Text className="text-orange-600 font-medium text-sm">See all</Text>
            </View>

            {/* Filter Chips */}
            <View className="mb-4">
                <View className="flex-row">
                    <FilterChip label="Nearest" value="nearest" />
                    <FilterChip label="Top Rated" value="topRated" />
                    <FilterChip label="Best Value" value="bestValue" />
                </View>
            </View>

            <FlatList
                data={sortedPosts}
                keyExtractor={(item) => item.id || Math.random().toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
                                    maxQuantity: item.quantity,
                                    supplierId: item.supplierId || "supplier_default"
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
