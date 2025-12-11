import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import feedReducer from './slices/feedSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        orders: ordersReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['feed/fetchPosts/fulfilled', 'feed/addNewPost/fulfilled'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['feed.posts.createdAt', 'orders.orders'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
