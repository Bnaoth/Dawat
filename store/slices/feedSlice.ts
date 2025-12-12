import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, storage, auth } from '../../constants/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

// Types
export const FOOD_CATEGORIES = ['Chicken', 'Mutton', 'Prawns', 'Fish', 'Other'] as const;
export type FoodCategory = typeof FOOD_CATEGORIES[number];

export interface Post {
    id?: string;
    title: string;
    chef: string;
    chefAvatar: string;
    distance: string;
    price: string;
    image: string;
    allImages: string[];
    quantity: string;
    rating: number;
    location: string;
    category?: FoodCategory;
    ingredients?: string[];
    postedAgo?: string;
    // Supplier location data
    supplierId?: string;
    supplierPostcode?: string;
    supplierLat?: number;
    supplierLng?: number;
    createdAt?: number; // serialized timestamp
    // Supplier metrics
    supplierRating?: number;
    avgResponseTime?: number; // in minutes
    isFavorite?: boolean;
}

interface FeedState {
    posts: Post[];
    loading: boolean;
    error: string | null;
}

const initialState: FeedState = {
    posts: [],
    loading: false,
    error: null,
};

// Thunks
export const fetchPosts = createAsyncThunk('feed/fetchPosts', async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    // Filter threshold: 4 hours (freshness cutoff)
    const HOURS_THRESHOLD = 4;
    const now = Date.now();
    const thresholdTime = now - (HOURS_THRESHOLD * 60 * 60 * 1000);
    
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postTime = data.createdAt?.toMillis() || Date.now();
        
        // Only include posts created within the last 5 hours
        if (postTime >= thresholdTime) {
            posts.push({
                id: doc.id,
                ...data,
                createdAt: postTime
            } as Post);
        }
    });
    return posts;
});

export const addNewPost = createAsyncThunk(
    'feed/addNewPost',
    async (postData: Omit<Post, 'id' | 'createdAt' | 'image' | 'allImages'> & { localImages: string[] }) => {

        // --- FULL LOCAL MOCK MODE ---
        // Bypassing Firebase Auth, Storage, and Firestore completely due to network/env issues.
        // This processes the post purely effectively in Redux.

        // 1. Use Local Images
        const imageUrls = postData.localImages;

        // 2. Create Mock Post Object with supplier location data
        const newPost: Post = {
            id: `local_${Date.now()}`,
            title: postData.title,
            chef: postData.chef,
            chefAvatar: postData.chefAvatar,
            distance: postData.distance,
            price: postData.price,
            image: imageUrls[0],
            allImages: imageUrls,
            ingredients: (postData as any).ingredients || [],
            quantity: postData.quantity,
            rating: 5.0,
            location: postData.location,
            category: (postData as any).category,
            supplierId: (postData as any).supplierId,
            supplierPostcode: postData.supplierPostcode,
            supplierLat: postData.supplierLat,
            supplierLng: postData.supplierLng,
            createdAt: Date.now(),
        };

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return serializable data for Redux state
        return newPost;
    }
);

export const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        updatePostRating: (state, action: PayloadAction<{ postId: string; newRating: number }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                post.rating = action.payload.newRating;
            }
        },
        deletePost: (state, action: PayloadAction<string>) => {
            state.posts = state.posts.filter(post => post.id !== action.payload);
        },
        repostPost: (state, action: PayloadAction<{ post: Post; quantity: string; price: string }>) => {
            const { post, quantity, price } = action.payload;
            const newPost: Post = {
                ...post,
                id: `repost_${Date.now()}`,
                quantity,
                price,
                createdAt: Date.now(),
            };
            state.posts.unshift(newPost);
        },
        updatePost: (state, action: PayloadAction<{ postId: string; quantity: string; price: string }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                post.quantity = action.payload.quantity;
                post.price = action.payload.price;
            }
        },
        decreasePostQuantity: (state, action: PayloadAction<{ postId: string; orderedQuantity: number }>) => {
            const post = state.posts.find(p => p.id === action.payload.postId);
            if (post) {
                const currentQty = parseInt(post.quantity.replace(/[^0-9]/g, '') || '0');
                const newQty = Math.max(0, currentQty - action.payload.orderedQuantity);
                
                if (newQty === 0) {
                    // Auto-delete post when sold out
                    state.posts = state.posts.filter(p => p.id !== action.payload.postId);
                } else {
                    post.quantity = `${newQty} Plates`;
                }
            }
        },
        toggleFavorite: (state, action: PayloadAction<string>) => {
            const post = state.posts.find(p => p.id === action.payload);
            if (post) {
                post.isFavorite = !post.isFavorite;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                
                // Filter threshold: 4 hours
                const HOURS_THRESHOLD = 4;
                const now = Date.now();
                const thresholdTime = now - (HOURS_THRESHOLD * 60 * 60 * 1000);
                
                // Get existing posts that are still fresh
                const freshExistingPosts = state.posts.filter(post => 
                    post.createdAt && post.createdAt >= thresholdTime
                );
                
                // Merge: new posts from Firebase + fresh existing posts (avoiding duplicates)
                const newPosts = action.payload;
                const existingIds = new Set(freshExistingPosts.map(p => p.id));
                
                // Add new posts that don't exist in existing fresh posts
                const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
                
                // Combine and sort by createdAt (newest first)
                state.posts = [...uniqueNewPosts, ...freshExistingPosts].sort((a, b) => 
                    (b.createdAt || 0) - (a.createdAt || 0)
                );
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch feed';
            })
            // Add Post
            .addCase(addNewPost.pending, (state) => {
                state.loading = true;
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                state.loading = false;
                // Add new post to start of list
                state.posts.unshift(action.payload as Post);
            })
            .addCase(addNewPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to post food';
            });
    },
});

export const { updatePostRating, deletePost, updatePost, decreasePostQuantity, toggleFavorite, repostPost } = feedSlice.actions;

export default feedSlice.reducer;
