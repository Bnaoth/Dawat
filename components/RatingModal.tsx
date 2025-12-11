import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, review?: string) => void;
    orderTitle: string;
    recipientName: string;
}

export default function RatingModal({ 
    visible, 
    onClose, 
    onSubmit, 
    orderTitle, 
    recipientName 
}: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert("Rate the order", "Please select a star rating before submitting.");
            return;
        }

        onSubmit(rating, review.trim() || undefined);
        
        // Reset state
        setRating(0);
        setReview("");
        onClose();
    };

    const handleClose = () => {
        setRating(0);
        setReview("");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
                <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                    {/* Header */}
                    <View className="items-center mb-6">
                        <View className="bg-orange-100 p-4 rounded-full mb-4">
                            <Ionicons name="star" size={32} color="#EA580C" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-2">Rate Your Order</Text>
                        <Text className="text-gray-500 text-center">
                            How was your {orderTitle}?
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-1">
                            from {recipientName}
                        </Text>
                    </View>

                    {/* Star Rating */}
                    <View className="flex-row justify-center gap-3 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                className="p-2"
                            >
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Rating Description */}
                    {rating > 0 && (
                        <Text className="text-center text-gray-600 font-medium mb-4">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                        </Text>
                    )}

                    {/* Review Text */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">
                            Write a review (optional)
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            placeholder="Share your experience..."
                            value={review}
                            onChangeText={setReview}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={300}
                        />
                        <Text className="text-gray-400 text-xs mt-1 text-right">
                            {review.length}/300
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-700 font-bold text-base">Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className={`flex-1 py-4 rounded-xl items-center ${
                                rating === 0 ? "bg-gray-300" : "bg-orange-600"
                            }`}
                            disabled={rating === 0}
                        >
                            <Text className="text-white font-bold text-base">Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
