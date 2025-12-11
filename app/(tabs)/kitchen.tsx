import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { updateOrderStatus, verifyPasscode, rateOrder, Order } from "../../store/slices/ordersSlice";
import { updatePostRating, deletePost, updatePost, Post } from "../../store/slices/feedSlice";
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
    
    // Filter orders for current supplier
    const incomingOrders = orders.filter(order => 
        order.supplierId === (user.firstName || "supplier_default")
    );

    // Filter posts for current supplier
    const myPosts = posts.filter(post =>
        post.supplierId === (user.firstName || "supplier_default")
    );

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [enteredPasscode, setEnteredPasscode] = useState("");
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    
    // My Posts management
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editQuantity, setEditQuantity] = useState("1");
    const [editPrice, setEditPrice] = useState("Free");
    const [activePickerType, setActivePickerType] = useState<'quantity' | 'price' | null>(null);

    const handleMarkReady = async (orderId: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status: 'ready' })).unwrap();
            Alert.alert("Success", "Order marked as ready for pickup!");
        } catch (error) {
            Alert.alert("Error", "Failed to update order status");
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-gray-900">My Kitchen</Text>
                    <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
                        <Ionicons name="settings-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Analytics Section */}
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Analytics</Text>
                <View className="flex-row justify-between">
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">{incomingOrders.length}</Text>
                        <Text className="text-gray-500 text-xs">Today's Orders</Text>
                    </View>
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">{myPosts.length}</Text>
                        <Text className="text-gray-500 text-xs">Active Posts</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-3xl font-bold text-orange-600">{myPosts.reduce((sum, p) => sum + parseInt(p.quantity.replace(/[^0-9]/g, '') || '0'), 0)}</Text>
                        <Text className="text-gray-500 text-xs">Total Items</Text>
                    </View>
                </View>
            </View>

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
                                        <Text className="text-base font-bold text-gray-900">{item.title}</Text>
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
                                    <Text className="text-lg font-bold text-gray-900">{order.postTitle}</Text>
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
                                        {order.status === 'submitted' ? 'New' :
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

                            {order.status === 'submitted' && (
                                <TouchableOpacity
                                    onPress={() => handleMarkReady(order.orderId)}
                                    className="bg-green-600 py-3 rounded-lg items-center"
                                >
                                    <Text className="text-white font-bold">Mark Ready for Pickup</Text>
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
