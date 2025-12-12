import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db } from '../../constants/firebaseConfig';
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot, getDocs } from 'firebase/firestore';

export type OrderStatus = 'submitted' | 'ready' | 'completed' | 'cancelled';

export interface Order {
    id?: string;
    orderId: string;
    passcode: string;
    customerId: string;
    customerName: string;
    customerPostcode?: string;
    supplierId: string;
    supplierName: string;
    postId: string;
    postTitle: string;
    quantity: number;
    pricePerItem: string;
    totalPrice: string;
    status: OrderStatus;
    createdAt: number;
    readyAt?: number;
    completedAt?: number;
    etaMinutes?: number;
    customerRating?: number;
    customerReview?: string;
    supplierRating?: number;
    supplierReview?: string;
}

interface OrdersState {
    orders: Order[];
    myOrders: Order[]; // Orders I placed as customer
    incomingOrders: Order[]; // Orders I received as supplier
    loading: boolean;
    error: string | null;
}

const initialState: OrdersState = {
    orders: [],
    myOrders: [],
    incomingOrders: [],
    loading: false,
    error: null,
};

// Generate random 4-digit passcode
const generatePasscode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Create new order
export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData: {
        customerId: string;
        customerName: string;
        customerPostcode?: string;
        supplierId: string;
        supplierName: string;
        postId: string;
        postTitle: string;
        quantity: number;
        pricePerItem: string;
    }) => {
        const passcode = generatePasscode();
        const orderId = `ORD-${Date.now()}`;
        
        const priceValue = parseFloat(orderData.pricePerItem.replace(/[^0-9.]/g, '')) || 0;
        const totalPrice = orderData.pricePerItem === 'Free' 
            ? 'Free' 
            : `£${(priceValue * orderData.quantity).toFixed(2)}`;

        const newOrder: Omit<Order, 'id'> = {
            orderId,
            passcode,
            customerId: orderData.customerId,
            customerName: orderData.customerName,
            customerPostcode: orderData.customerPostcode,
            supplierId: orderData.supplierId,
            supplierName: orderData.supplierName,
            postId: orderData.postId,
            postTitle: orderData.postTitle,
            quantity: orderData.quantity,
            pricePerItem: orderData.pricePerItem,
            totalPrice,
            status: 'submitted',
            createdAt: Date.now(),
        };

        // Add to Firestore (or local Redux for now)
        // const docRef = await addDoc(collection(db, 'orders'), newOrder);
        
        // For now, use local storage
        return {
            ...newOrder,
            id: orderId,
        } as Order;
    }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status, etaMinutes }: { orderId: string; status: OrderStatus; etaMinutes?: number }) => {
        const timestamp = Date.now();
        
        // Update in Firestore
        // await updateDoc(doc(db, 'orders', orderId), {
        //     status,
        //     ...(status === 'ready' && { readyAt: timestamp, etaMinutes }),
        //     ...(status === 'completed' && { completedAt: timestamp }),
        // });

        return { orderId, status, timestamp, etaMinutes };
    }
);

// Verify passcode and complete order
export const verifyPasscode = createAsyncThunk(
    'orders/verifyPasscode',
    async ({ orderId, passcode }: { orderId: string; passcode: string }, { getState }) => {
        const state = getState() as { orders: OrdersState };
        const order = state.orders.orders.find(o => o.orderId === orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.passcode !== passcode) {
            throw new Error('Invalid passcode');
        }

        // Update status to completed
        // await updateDoc(doc(db, 'orders', orderId), {
        //     status: 'completed',
        //     completedAt: Date.now(),
        // });

        return { orderId, status: 'completed' as OrderStatus, timestamp: Date.now() };
    }
);

// Add rating to order
export const rateOrder = createAsyncThunk(
    'orders/rateOrder',
    async ({
        orderId,
        rating,
        review,
        raterType,
    }: {
        orderId: string;
        rating: number;
        review?: string;
        raterType: 'customer' | 'supplier';
    }) => {
        // Update in Firestore
        // await updateDoc(doc(db, 'orders', orderId), {
        //     ...(raterType === 'customer' && { 
        //         customerRating: rating, 
        //         customerReview: review 
        //     }),
        //     ...(raterType === 'supplier' && { 
        //         supplierRating: rating, 
        //         supplierReview: review 
        //     }),
        // });

        return { orderId, rating, review, raterType };
    }
);

export const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setMyOrders: (state, action: PayloadAction<Order[]>) => {
            state.myOrders = action.payload;
        },
        setIncomingOrders: (state, action: PayloadAction<Order[]>) => {
            state.incomingOrders = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.push(action.payload);
                state.myOrders.push(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create order';
            })
            // Update Order Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, status, timestamp, etaMinutes } = action.payload;
                const order = state.orders.find(o => o.orderId === orderId);
                if (order) {
                    order.status = status;
                    if (status === 'ready') {
                        order.readyAt = timestamp;
                        if (etaMinutes !== undefined) order.etaMinutes = etaMinutes;
                    }
                    if (status === 'completed') order.completedAt = timestamp;
                }
            })
            // Verify Passcode
            .addCase(verifyPasscode.fulfilled, (state, action) => {
                const { orderId, status, timestamp } = action.payload;
                const order = state.orders.find(o => o.orderId === orderId);
                if (order) {
                    order.status = status;
                    order.completedAt = timestamp;
                }
            })
            .addCase(verifyPasscode.rejected, (state, action) => {
                state.error = action.error.message || 'Invalid passcode';
            })
            // Rate Order
            .addCase(rateOrder.fulfilled, (state, action) => {
                const { orderId, rating, review, raterType } = action.payload;
                const order = state.orders.find(o => o.orderId === orderId);
                if (order) {
                    if (raterType === 'customer') {
                        order.customerRating = rating;
                        order.customerReview = review;
                    } else {
                        order.supplierRating = rating;
                        order.supplierReview = review;
                    }
                }
            });
    },
});

export const { setMyOrders, setIncomingOrders } = ordersSlice.actions;

export default ordersSlice.reducer;
