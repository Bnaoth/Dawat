import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    // Display name and avatar
    name: string;
    location: string;
    avatar: string; // URL or simplified string for now
    // Address fields from registration
    firstName: string;
    lastName: string;
    postcode: string;
    address: string;
    city: string;
    county: string;
    // User's current location (lat/lng for distance calculation)
    userLat: number | null;
    userLng: number | null;
    locationLoaded: boolean;
}

const initialState: UserState = {
    name: "Ganesh Banoth",
    location: "London, UK",
    avatar: "profile.png",
    firstName: "",
    lastName: "",
    postcode: "",
    address: "",
    city: "",
    county: "",
    userLat: null,
    userLng: null,
    locationLoaded: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload };
        },
        updateLocation: (state, action: PayloadAction<string>) => {
            state.location = action.payload;
        },
        setUserAddress: (state, action: PayloadAction<{
            firstName: string;
            lastName: string;
            postcode: string;
            address: string;
            city: string;
            county: string;
        }>) => {
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.postcode = action.payload.postcode;
            state.address = action.payload.address;
            state.city = action.payload.city;
            state.county = action.payload.county;
        },
        setUserLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
            state.userLat = action.payload.lat;
            state.userLng = action.payload.lng;
            state.locationLoaded = true;
        },
    },
});

export const { setUser, updateLocation, setUserAddress, setUserLocation } = userSlice.actions;

export default userSlice.reducer;
