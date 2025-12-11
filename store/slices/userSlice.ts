import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    name: string;
    location: string;
    avatar: string; // URL or simplified string for now
}

const initialState: UserState = {
    name: "Ganesh Banoth",
    location: "London, UK",
    avatar: "profile.png",
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            state.name = action.payload.name;
            state.location = action.payload.location;
            state.avatar = action.payload.avatar;
        },
        updateLocation: (state, action: PayloadAction<string>) => {
            state.location = action.payload;
        },
    },
});

export const { setUser, updateLocation } = userSlice.actions;

export default userSlice.reducer;
