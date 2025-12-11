import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, storage, auth } from '../../constants/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

// Types
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
    createdAt?: number; // serialized timestamp
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
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis() || Date.now()
        } as Post);
    });
    return posts;
});

export const addNewPost = createAsyncThunk(
    'feed/addNewPost',
    async (postData: Omit<Post, 'id' | 'createdAt' | 'image' | 'allImages'> & { localImages: string[] }) => {

        // --- FULL LOCAL MOCK MODE ---
        // Bypassing Firebase Auth, Storage, and Firestore completely due to network/env issues.
        // This processes the post purely effectively in Redux.

        // Ensure Auth for Storage Rules
        // try {
        //     if (!auth.currentUser) {
        //         console.log("Attempting anonymous sign-in...");
        //         await signInAnonymously(auth);
        //         console.log("Signed in anonymously:", auth.currentUser?.uid);
        //     }
        // } catch (authError: any) {
        //     console.error("Auth Error:", authError);
        //     throw new Error(`Authentication failed: ${authError.message}`);
        // }

        // 1. Use Local Images
        const imageUrls = postData.localImages;

        // 2. Create Mock Post Object
        const newPost: Post = {
            id: `local_${Date.now()}`,
            title: postData.title,
            chef: postData.chef,
            chefAvatar: postData.chefAvatar,
            distance: postData.distance,
            price: postData.price,
            image: imageUrls[0],
            allImages: imageUrls,
            ingredients: postData.ingredients || [],
            quantity: postData.quantity,
            rating: 5.0,
            location: postData.location,
            createdAt: Date.now(),
        };

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Create Doc
        // const newPost = {
        //     title: postData.title,
        //     chef: postData.chef,
        //     chefAvatar: postData.chefAvatar,
        //     distance: postData.distance,
        //     price: postData.price,
        //     image: imageUrls[0],
        //     allImages: imageUrls,
        //     ingredients: postData.ingredients || [],
        //     quantity: postData.quantity,
        //     rating: 5.0,
        //     location: postData.location,
        //     createdAt: serverTimestamp(),
        // };

        // const docRef = await addDoc(collection(db, 'posts'), newPost);

        // Return serializable data for Redux state
        return newPost;
    }
);

export const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
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

export default feedSlice.reducer;
