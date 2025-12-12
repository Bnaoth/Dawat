import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { rateOrder, Order } from "../../store/slices/ordersSlice";
import { updatePostRating, toggleFavorite } from "../../store/slices/feedSlice";
import { useState } from "react";
import RatingModal from "../../components/RatingModal";

export default function ProfileScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { orders } = useSelector((state: RootState) => state.orders);
    const posts = useSelector((state: RootState) => state.feed.posts);
    
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // Filter orders where user is the customer
    const myOrders = orders.filter(order => 
        order.customerId === (user.firstName || "customer_123")
    );
    
    const completedOrders = myOrders.filter(order => order.status === 'completed');
    const unratedOrders = completedOrders.filter(order => !order.customerRating);
    const favoritePost = posts.find(p => p.isFavorite);

    const handleRateOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowRatingModal(true);
    };

    const handleSubmitRating = async (rating: number, review?: string) => {
        if (!selectedOrder) return;

        try {
            // Submit customer rating
            await dispatch(rateOrder({
                orderId: selectedOrder.orderId,
                rating,
                review,
                raterType: 'customer'
            })).unwrap();

            // Calculate new average rating for the post
            const post = posts.find(p => p.id === selectedOrder.postId);
            if (post) {
                // Get all ratings for this post
                const postOrders = orders.filter(o => o.postId === selectedOrder.postId && o.customerRating);
                const totalRatings = postOrders.length + 1; // +1 for the new rating
                const sumRatings = postOrders.reduce((sum, o) => sum + (o.customerRating || 0), 0) + rating;
                const newAvgRating = Number((sumRatings / totalRatings).toFixed(1));
                
                // Update post rating
                dispatch(updatePostRating({ 
                    postId: selectedOrder.postId, 
                    newRating: newAvgRating 
                }));
            }

            setSelectedOrder(null);
        } catch (error) {
            console.error("Failed to submit rating:", error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-6 items-center border-b border-gray-100">
                <Image
                    source={require("../../assets/images/profile.png")}
                    className="w-24 h-24 rounded-full mb-3"
                />
                <Text className="text-xl font-bold text-gray-900">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "User"}
                </Text>
                <Text className="text-gray-500">{user.city || "London"}, UK</Text>
            </View>

            <ScrollView className="p-4">
                {/* Favorites Section */}
                {posts.filter(p => p.isFavorite).length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Saved Favorites ({posts.filter(p => p.isFavorite).length})</Text>
                        {posts.filter(p => p.isFavorite).map((post) => (
                            <View key={post.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-red-100">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-base font-bold text-gray-900">{post.title}</Text>
                                            <Ionicons name="heart" size={14} color="#EF4444" />
                                        </View>
                                        <Text className="text-sm text-gray-500">by {post.chef}</Text>
                                    </View>
                                    <Text className="text-lg font-bold text-orange-600">{post.price}</Text>
                                </View>
                                <View className="flex-row gap-2 mt-3">
                                    <TouchableOpacity
                                        onPress={() => {
                                            // Quick reorder: navigate to order with preset quantity
                                            // For now, just show alert
                                        }}
                                        className="flex-1 bg-orange-600 py-2 rounded-lg items-center"
                                    >
                                        <Text className="text-white font-semibold text-xs">Quick Reorder</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => post.id && dispatch(toggleFavorite(post.id))}
                                        className="bg-red-100 px-3 py-2 rounded-lg"
                                    >
                                        <Ionicons name="heart" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* iew className="p-4">
                {/* Orders Section */}
                {myOrders.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-3">My Orders ({myOrders.length})</Text>
                        
                        {myOrders.map((order) => (
                            <View key={order.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-gray-900">{order.postTitle}</Text>
                                        <Text className="text-sm text-gray-500">from {order.supplierName}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${
                                        order.status === 'completed' ? 'bg-green-100' :
                                        order.status === 'ready' ? 'bg-blue-100' :
                                        'bg-yellow-100'
                                    }`}>
                                        <Text className={`text-xs font-bold ${
                                            order.status === 'completed' ? 'text-green-700' :
                                            order.status === 'ready' ? 'text-blue-700' :
                                            'text-yellow-700'
                                        }`}>
                                            {order.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mt-3">
                                    <Text className="text-sm text-gray-600">
                                        {order.quantity} × {order.pricePerItem} = {order.totalPrice}
                                    </Text>
                                    
                                    {order.status === 'completed' && !order.customerRating && (
                                        <TouchableOpacity
                                            onPress={() => handleRateOrder(order)}
                                            className="bg-orange-600 px-4 py-2 rounded-lg flex-row items-center gap-1"
                                        >
                                            <Ionicons name="star" size={14} color="white" />
                                            <Text className="text-white font-semibold text-xs">Rate</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {order.customerRating && (
                                        <View className="flex-row items-center gap-1">
                                            <Ionicons name="star" size={14} color="#F59E0B" />
                                            <Text className="text-gray-700 font-semibold text-sm">
                                                {order.customerRating.toFixed(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Settings Section */}
                <View className="bg-white rounded-xl overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
                        <View className="bg-orange-100 p-2 rounded-full mr-3">
                            <Ionicons name="receipt-outline" size={20} color="#EA580C" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Order History</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
                        <View className="bg-blue-100 p-2 rounded-full mr-3">
                            <Ionicons name="card-outline" size={20} color="#2563EB" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4">
                        <View className="bg-gray-100 p-2 rounded-full mr-3">
                            <Ionicons name="settings-outline" size={20} color="#4B5563" />
                        </View>
                        <Text className="flex-1 text-gray-700 font-medium">Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="bg-red-50 p-4 rounded-xl items-center">
                    <Text className="text-red-600 font-bold">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Rating Modal */}
            <RatingModal
                visible={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleSubmitRating}
                orderTitle={selectedOrder?.postTitle || "this order"}
                recipientName={selectedOrder?.supplierName || "the chef"}
            />
        </SafeAreaView>
    );
}
