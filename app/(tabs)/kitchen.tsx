import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { updateOrderStatus, verifyPasscode, rateOrder, Order } from "../../store/slices/ordersSlice";
import { updatePostRating } from "../../store/slices/feedSlice";
import { useState, useEffect } from "react";
import RatingModal from "../../components/RatingModal";

export default function KitchenScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const { orders } = useSelector((state: RootState) => state.orders);
    
    // Filter orders for current supplier
    const incomingOrders = orders.filter(order => 
        order.supplierId === (user.firstName || "supplier_default")
    );

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [enteredPasscode, setEnteredPasscode] = useState("");
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

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

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-900">My Kitchen</Text>
                <TouchableOpacity className="bg-gray-200 p-2 rounded-full">
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Analytics Section */}
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Analytics</Text>
                <View className="flex-row justify-between">
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">12</Text>
                        <Text className="text-gray-500 text-xs">Today's Orders</Text>
                    </View>
                    <View className="items-center flex-1 border-r border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">£85</Text>
                        <Text className="text-gray-500 text-xs">Earnings</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-3xl font-bold text-orange-600">48</Text>
                        <Text className="text-gray-500 text-xs">Profile Views</Text>
                    </View>
                </View>
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

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
        </SafeAreaView>
    );
}
