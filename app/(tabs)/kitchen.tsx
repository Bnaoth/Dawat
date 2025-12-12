import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { updateOrderStatus, verifyPasscode, rateOrder, Order } from "../../store/slices/ordersSlice";
import { updatePostRating, deletePost, updatePost, decreasePostQuantity, Post, addNewPost, repostPost, toggleFavorite } from "../../store/slices/feedSlice";
import { toggleNotifications } from "../../store/slices/userSlice";
import { useState, useEffect } from "react";
import RatingModal from "../../components/RatingModal";

const QUANTITY_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1));
const PRICE_OPTIONS = ["Free", ...Array.from({ length: 40 }, (_, i) => `£${(i + 1) * 0.50 ? ((i + 1) * 0.50).toFixed(2) : ""}`)];

export default function KitchenScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { orders } = useSelector((state: RootState) => state.orders);
    const { posts } = useSelector((state: RootState) => state.feed);
    
    // Filter posts for current supplier (must be before it's used)
    const myPosts = posts.filter(post =>
        post.supplierId === (user.firstName || "supplier_default")
    );
    
    // Filter orders for current supplier
    const incomingOrders = orders.filter(order => 
        order.supplierId === (user.firstName || "supplier_default")
    );

    const completedOrders = orders.filter(order => 
        order.supplierId === (user.firstName || "supplier_default") && order.status === 'completed'
    );

    const supplierOrders = orders.filter(order => 
        order.supplierId === (user.firstName || "supplier_default")
    );

    const today = new Date();
    const isSameDay = (ts?: number) => {
        if (!ts) return false;
        const d = new Date(ts);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    };

    const parsePrice = (price: string) => {
        if (price.toLowerCase() === 'free') return 0;
        return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    };

    const completedRevenue = completedOrders.reduce((sum, o) => sum + parsePrice(o.totalPrice), 0);
    const todayRevenue = completedOrders.filter(o => isSameDay(o.completedAt)).reduce((sum, o) => sum + parsePrice(o.totalPrice), 0);

    const sevenDaysAgo = today.getTime() - (6 * 24 * 60 * 60 * 1000);
    const thisWeekRevenue = completedOrders
        .filter(o => (o.completedAt || 0) >= sevenDaysAgo)
        .reduce((sum, o) => sum + parsePrice(o.totalPrice), 0);

    // Best seller by completed order count
    const salesByPost: Record<string, number> = {};
    completedOrders.forEach(o => {
        salesByPost[o.postId] = (salesByPost[o.postId] || 0) + o.quantity;
    });
    const bestSellerId = Object.entries(salesByPost).sort((a, b) => b[1] - a[1])[0]?.[0];

    const recentReviews = completedOrders
        .filter(o => o.customerReview || o.customerRating)
        .slice(-3)
        .reverse();

    const earningsByPost = Object.entries(salesByPost).map(([postId, qty]) => {
        const revenue = completedOrders
            .filter(o => o.postId === postId)
            .reduce((sum, o) => sum + parsePrice(o.totalPrice), 0);
        const title = completedOrders.find(o => o.postId === postId)?.postTitle || 'Unknown';
        return { postId, title, qty, revenue };
    }).sort((a, b) => b.revenue - a.revenue);

    const averageDishRating = myPosts.length > 0
        ? myPosts.reduce((sum, p) => sum + p.rating, 0) / myPosts.length
        : 0;

    const completionRate = supplierOrders.length === 0
        ? 0
        : (completedOrders.length / supplierOrders.length) * 100;

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [enteredPasscode, setEnteredPasscode] = useState("");
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [showEtaModal, setShowEtaModal] = useState(false);
    const [etaOrderId, setEtaOrderId] = useState<string | null>(null);
    const [etaMinutes, setEtaMinutes] = useState("15");
    const [showSettings, setShowSettings] = useState(false);
    
    // My Posts management
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editQuantity, setEditQuantity] = useState("1");
    const [editPrice, setEditPrice] = useState("Free");
    const [activePickerType, setActivePickerType] = useState<'quantity' | 'price' | null>(null);

    const handleMarkReady = (orderId: string) => {
        setEtaOrderId(orderId);
        setEtaMinutes("15");
        setShowEtaModal(true);
    };

    const handleConfirmEta = async () => {
        if (!etaOrderId) return;
        const eta = parseInt(etaMinutes, 10) || 15;
        try {
            await dispatch(updateOrderStatus({ orderId: etaOrderId, status: 'ready', etaMinutes: eta })).unwrap();
            Alert.alert("Success", `Order marked as ready. ETA ${eta} mins`);
        } catch (error) {
            Alert.alert("Error", "Failed to update order status");
        } finally {
            setShowEtaModal(false);
            setEtaOrderId(null);
        }
    };

    const handleVerifyPasscode = async () => {
        if (!selectedOrder) return;

        try {
            await dispatch(verifyPasscode({ orderId: selectedOrder, passcode: enteredPasscode })).unwrap();
            
            const order = orders.find(o => o.orderId === selectedOrder);
            if (order) {
                setCompletedOrder(order);
            }
            
            setShowPasscodeModal(false);
            setEnteredPasscode("");
            setSelectedOrder(null);
            
            Alert.alert("Success", "Order completed! Thank you.");
            
            // Show rating modal after brief delay
            setTimeout(() => {
                setShowRatingModal(true);
            }, 500);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Invalid passcode");
        }
    };

    const handleSubmitRating = async (rating: number, review?: string) => {
        if (!completedOrder) return;

        try {
            // Submit supplier's rating of the customer
            await dispatch(rateOrder({
                orderId: completedOrder.orderId,
                rating,
                review,
                raterType: 'supplier'
            })).unwrap();

            Alert.alert("Thanks!", "Your rating has been submitted.");
            setCompletedOrder(null);
        } catch (error) {
            Alert.alert("Error", "Failed to submit rating");
        }
    };

    const handleDeletePost = (postId: string, postTitle: string) => {
        Alert.alert(
            "Delete Post",
            `Are you sure you want to delete "${postTitle}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        dispatch(deletePost(postId));
                        Alert.alert("Deleted", "Post removed from feed");
                    }
                }
            ]
        );
    };

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        const qty = post.quantity?.replace(/[^0-9]/g, '') || "1";
        setEditQuantity(qty);
        setEditPrice(post.price);
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editingPost) return;
        
        dispatch(updatePost({
            postId: editingPost.id!,
            quantity: `${editQuantity} Plates`,
            price: editPrice
        }));
        
        Alert.alert("Updated", "Your post has been updated!");
        setShowEditModal(false);
        setEditingPost(null);
    };

    const getPickerData = () => {
        if (activePickerType === 'quantity') return QUANTITY_OPTIONS;
        if (activePickerType === 'price') return PRICE_OPTIONS;
        return [];
    };

    const handleSelectOption = (item: string) => {
        if (activePickerType === 'quantity') setEditQuantity(item);
        if (activePickerType === 'price') setEditPrice(item);
        setActivePickerType(null);
        setTimeout(() => setShowEditModal(true), 100);
    };

    const handleRepost = (post: Post) => {
        const qty = parseInt(post.quantity.replace(/[^0-9]/g, '') || '0');
        const nextQty = qty > 0 ? `${qty} Plates` : '10 Plates';
        dispatch(repostPost({ post, quantity: nextQty, price: post.price }));
        Alert.alert("Reposted", `${post.title} duplicated. Adjust details anytime.`);
    };

    const handleToggleNotifications = () => {
        dispatch(toggleNotifications());
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return "--";
        const d = new Date(timestamp);
        const hrs = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        return `${hrs}:${mins}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-gray-900">My Kitchen</Text>
                    <TouchableOpacity 
                        onPress={() => setShowSettings(!showSettings)}
                        className="bg-gray-200 p-2 rounded-full"
                    >
                        <Ionicons name="settings-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                {showSettings && (
                    <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                        <Text className="text-sm font-semibold text-gray-800 mb-3">Settings</Text>
                        <TouchableOpacity 
                            onPress={handleToggleNotifications}
                            className="flex-row justify-between items-center py-3 border-b border-gray-100"
                        >
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="notifications" size={18} color={user.enableOrderNotifications ? '#EA580C' : '#9CA3AF'} />
                                <Text className="text-sm text-gray-800">Order Alerts</Text>
                            </View>
                            <View className={`w-12 h-6 rounded-full ${user.enableOrderNotifications ? 'bg-orange-600' : 'bg-gray-300'} items-center justify-center`}>
                                <View className={`w-5 h-5 rounded-full bg-white ${user.enableOrderNotifications ? 'ml-3' : 'mr-3'}`} />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-xs text-gray-500 mt-2">Sound & badge alerts for new orders</Text>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Analytics Section */}
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold text-gray-800">Earnings</Text>
                    <Text className="text-xs text-gray-500">Auto from completed orders</Text>
                </View>
                <View className="flex-row justify-between">
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">£{todayRevenue.toFixed(2)}</Text>
                        <Text className="text-gray-500 text-xs">Today</Text>
                    </View>
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">£{thisWeekRevenue.toFixed(2)}</Text>
                        <Text className="text-gray-500 text-xs">Last 7 days</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-3xl font-bold text-orange-600">£{completedRevenue.toFixed(2)}</Text>
                        <Text className="text-gray-500 text-xs">Total</Text>
                    </View>
                </View>

                {earningsByPost.length > 0 && (
                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm font-semibold text-gray-700">Top dishes</Text>
                            <Text className="text-xs text-gray-500">By revenue</Text>
                        </View>
                        {earningsByPost.slice(0, 3).map(item => (
                            <View key={item.postId} className="flex-row justify-between py-1">
                                <Text className="text-sm text-gray-800 flex-1 pr-2" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-sm text-gray-500">{item.qty} sold</Text>
                                <Text className="text-sm font-semibold text-gray-900 ml-3">£{item.revenue.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Performance Insights */}
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold text-gray-800">Performance</Text>
                    <Text className="text-xs text-gray-500">Live signals</Text>
                </View>
                <View className="flex-row justify-between">
                    <View className="flex-1 items-start">
                        <Text className="text-xl font-bold text-gray-900">{completionRate.toFixed(0)}%</Text>
                        <Text className="text-xs text-gray-500">Completion rate</Text>
                    </View>
                    <View className="flex-1 items-start">
                        <View className="flex-row items-center gap-1">
                            <Text className="text-xl font-bold text-gray-900">{averageDishRating.toFixed(1)}</Text>
                            <Ionicons name="star" size={16} color="#F59E0B" />
                        </View>
                        <Text className="text-xs text-gray-500">Avg. dish rating</Text>
                    </View>
                    <View className="flex-1 items-start">
                        <Text className="text-xl font-bold text-gray-900">{bestSellerId ? "Most popular" : "--"}</Text>
                        <Text className="text-xs text-gray-500">Top seller badge</Text>
                    </View>
                </View>
                {bestSellerId && (
                    <View className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <Text className="text-sm font-semibold text-orange-700">Most Popular</Text>
                        <Text className="text-xs text-orange-600 mt-1" numberOfLines={1}>
                            {earningsByPost.find(e => e.postId === bestSellerId)?.title || "Top dish"}
                        </Text>
                    </View>
                )}
            </View>

            {/* Customer Reviews */}
            {recentReviews.length > 0 && (
                <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-bold text-gray-800">Recent Reviews</Text>
                        <Text className="text-xs text-gray-500">From completed orders</Text>
                    </View>
                    {recentReviews.map(review => (
                        <View key={review.orderId} className="border border-gray-100 rounded-xl p-3 mb-2">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>{review.postTitle}</Text>
                                {review.customerRating !== undefined && (
                                    <View className="flex-row items-center gap-1">
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <Text className="text-sm font-bold text-gray-800">{review.customerRating?.toFixed(1)}</Text>
                                    </View>
                                )}
                            </View>
                            {review.customerReview ? (
                                <Text className="text-sm text-gray-600" numberOfLines={3}>{review.customerReview}</Text>
                            ) : (
                                <Text className="text-xs text-gray-500">No comment left</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* My Posts Section */}
            <View className="mb-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800">My Posts ({myPosts.length})</Text>
                </View>

                {myPosts.length > 0 ? (
                    myPosts.map((item) => (
                        <View key={item.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-base font-bold text-gray-900">{item.title}</Text>
                                            {item.id === bestSellerId && (
                                                <View className="bg-orange-100 px-2 py-1 rounded-full">
                                                    <Text className="text-[10px] font-semibold text-orange-700">Most Popular</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-sm text-gray-500">{item.category}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">{item.postedAgo}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <Text className="text-sm font-bold text-gray-800">{item.rating.toFixed(1)}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mb-3 pt-2 border-t border-gray-100">
                                    <View>
                                        <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
                                        <Text className="text-lg font-bold text-orange-600">{item.price}</Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={() => handleEditPost(item)}
                                            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center gap-1"
                                        >
                                            <Ionicons name="pencil" size={14} color="white" />
                                            <Text className="text-white font-semibold text-xs">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeletePost(item.id!, item.title)}
                                            className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center gap-1"
                                        >
                                            <Ionicons name="trash" size={14} color="white" />
                                            <Text className="text-white font-semibold text-xs">Delete</Text>
                                        </TouchableOpacity>
                                        {parseInt(item.quantity.replace(/[^0-9]/g, '') || '0') === 0 && (
                                            <TouchableOpacity
                                                onPress={() => handleRepost(item)}
                                                className="bg-orange-600 px-4 py-2 rounded-lg flex-row items-center gap-1"
                                            >
                                                <Ionicons name="refresh" size={14} color="white" />
                                                <Text className="text-white font-semibold text-xs">Repost</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))
                ) : (
                    <View className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center">
                        <Ionicons name="document-outline" size={40} color="#9CA3AF" />
                        <Text className="text-gray-400 text-center mt-3">No posts yet.{"\n"}Upload your first item!</Text>
                    </View>
                )}
            </View>

            {/* Active Menu Section */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Incoming Orders ({incomingOrders.length})</Text>
                <TouchableOpacity
                    onPress={() => router.push("/post-food")}
                    className="bg-orange-600 px-4 py-2 rounded-full flex-row items-center gap-1"
                >
                    <Ionicons name="add" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">Post Food</Text>
                </TouchableOpacity>
            </View>

            {/* Incoming Orders */}
            {incomingOrders.length > 0 ? (
                incomingOrders.map((order) => (
                        <View key={order.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-lg font-bold text-gray-900">{order.postTitle}</Text>
                                        {order.status === 'submitted' && (
                                            <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                                                <View className="w-2 h-2 rounded-full bg-blue-500" />
                                                <Text className="text-[10px] font-semibold text-blue-700">New</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-sm text-gray-500">Customer: {order.customerName}</Text>
                                    <Text className="text-sm text-gray-600 mt-1">Quantity: {order.quantity} × {order.pricePerItem}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${
                                    order.status === 'submitted' ? 'bg-blue-100' :
                                    order.status === 'ready' ? 'bg-green-100' :
                                    'bg-gray-100'
                                }`}>
                                    <Text className={`text-xs font-bold ${
                                        order.status === 'submitted' ? 'text-blue-700' :
                                        order.status === 'ready' ? 'text-green-700' :
                                        'text-gray-700'
                                    }`}>
                                        {order.status === 'submitted' ? 'Submitted' :
                                         order.status === 'ready' ? 'Ready' :
                                         order.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-orange-50 p-3 rounded-lg mb-3 border border-orange-200">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-xs text-gray-600 mb-1">Collection Code</Text>
                                        <Text className="text-2xl font-bold text-orange-600 tracking-widest">{order.passcode}</Text>
                                    </View>
                                    <Ionicons name="key" size={32} color="#EA580C" />
                                </View>
                            </View>

                            <View className="flex-row justify-between mt-2 mb-3">
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-gray-500">Submitted</Text>
                                    <Text className="text-sm font-semibold text-gray-800">{formatTime(order.createdAt)}</Text>
                                </View>
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-gray-500">Ready</Text>
                                    <Text className="text-sm font-semibold text-gray-800">{formatTime(order.readyAt)}</Text>
                                </View>
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-gray-500">Completed</Text>
                                    <Text className="text-sm font-semibold text-gray-800">{formatTime(order.completedAt)}</Text>
                                </View>
                            </View>

                            {order.status === 'submitted' && (
                                <TouchableOpacity
                                    onPress={() => handleMarkReady(order.orderId)}
                                    className="bg-green-600 py-3 rounded-lg items-center"
                                >
                                    <Text className="text-white font-bold">Mark Ready with ETA</Text>
                                </TouchableOpacity>
                            )}

                            {order.status === 'ready' && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedOrder(order.orderId);
                                        setShowPasscodeModal(true);
                                    }}
                                    className="bg-orange-600 py-3 rounded-lg items-center"
                                >
                                    <Text className="text-white font-bold">Confirm Handover</Text>
                                    {order.etaMinutes ? (
                                        <Text className="text-white text-xs mt-1">ETA {order.etaMinutes} mins</Text>
                                    ) : null}
                                </TouchableOpacity>
                            )}

                            {order.status === 'completed' && (
                                <View className="bg-gray-100 py-3 rounded-lg items-center">
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                        <Text className="text-gray-700 font-semibold">Completed</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center mt-2">
                        <Ionicons name="basket-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-400 text-center mt-3">No incoming orders yet.{"\n"}Share your delicious food!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Passcode Verification Modal */}
            <Modal
                visible={showPasscodeModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPasscodeModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">Verify Passcode</Text>
                            <TouchableOpacity onPress={() => setShowPasscodeModal(false)}>
                                <Ionicons name="close" size={28} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-4">
                            Ask the customer for their 4-digit passcode to confirm handover
                        </Text>

                        <TextInput
                            className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 text-3xl font-bold text-center tracking-widest mb-6"
                            placeholder="0000"
                            value={enteredPasscode}
                            onChangeText={setEnteredPasscode}
                            keyboardType="number-pad"
                            maxLength={4}
                        />

                        <TouchableOpacity
                            onPress={handleVerifyPasscode}
                            disabled={enteredPasscode.length !== 4}
                            className={`py-4 rounded-xl items-center ${
                                enteredPasscode.length === 4 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}
                        >
                            <Text className="text-white font-bold text-lg">Confirm Handover</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ETA Modal */}
            <Modal
                visible={showEtaModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEtaModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-bold text-gray-900">Set ETA</Text>
                            <TouchableOpacity onPress={() => setShowEtaModal(false)}>
                                <Ionicons name="close" size={28} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-600 mb-4">Tell the customer when it will be ready.</Text>
                        <TextInput
                            className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-xl font-bold text-center mb-4"
                            keyboardType="number-pad"
                            value={etaMinutes}
                            onChangeText={setEtaMinutes}
                            maxLength={3}
                        />
                        <TouchableOpacity
                            onPress={handleConfirmEta}
                            className="bg-green-600 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Mark Ready</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Rating Modal for Customer */}
            <RatingModal
                visible={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false);
                    setCompletedOrder(null);
                }}
                onSubmit={handleSubmitRating}
                orderTitle={completedOrder?.postTitle || "this order"}
                recipientName={completedOrder?.customerName || "the customer"}
            />

            {/* Edit Post Modal */}
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">Edit Post</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={28} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {editingPost && (
                            <>
                                <Text className="text-lg font-bold text-gray-800 mb-2">{editingPost.title}</Text>
                                <Text className="text-gray-500 mb-6">{editingPost.category}</Text>

                                {/* Quantity Picker */}
                                <View className="mb-4">
                                    <Text className="text-lg font-bold text-gray-800 mb-2">Quantity</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowEditModal(false);
                                            setTimeout(() => setActivePickerType('quantity'), 100);
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                                    >
                                        <Text className="text-gray-900 text-lg">{editQuantity}</Text>
                                        <Ionicons name="chevron-down" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                {/* Price Picker */}
                                <View className="mb-6">
                                    <Text className="text-lg font-bold text-gray-800 mb-2">Price</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowEditModal(false);
                                            setTimeout(() => setActivePickerType('price'), 100);
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                                    >
                                        <Text className="text-gray-900 text-lg">{editPrice}</Text>
                                        <Ionicons name="chevron-down" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveEdit}
                                    className="bg-orange-600 py-4 rounded-xl items-center mb-3"
                                >
                                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Picker Modal */}
            <Modal
                visible={activePickerType !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setActivePickerType(null)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                            <Text className="text-lg font-bold text-gray-900">
                                {activePickerType === 'quantity' ? 'Select Quantity' : 'Select Price'}
                            </Text>
                            <TouchableOpacity onPress={() => setActivePickerType(null)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={getPickerData()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelectOption(item)}
                                    className="p-4 border-b border-gray-100"
                                >
                                    <Text className="text-gray-900 text-lg">{item}</Text>
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
