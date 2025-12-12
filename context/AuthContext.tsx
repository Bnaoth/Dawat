import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../constants/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';

export type UserProfile = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    postcode: string;
    address: string;
    city: string;
    county: string;
    mobileNumber: string;
    createdAt: string;
    name?: string;
    location?: string;
    avatar?: string;
};

type AuthContextType = {
    user: UserProfile | null;
    isLoading: boolean;
    isSignedIn: boolean;
    updateUser: (userData: Partial<UserProfile>) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const dispatch = useDispatch();

    // Bootstrap user from local storage and Firebase auth state
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                // Check if user data exists in local storage
                const savedUser = await AsyncStorage.getItem('user');
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    if (parsedUser.emailVerified === false) {
                        // Do not auto sign-in unverified users
                        await AsyncStorage.removeItem('user');
                    } else {
                        setUserState(parsedUser);
                        dispatch(setUser({
                            firstName: parsedUser.firstName,
                            lastName: parsedUser.lastName,
                            postcode: parsedUser.postcode,
                            address: parsedUser.address,
                            city: parsedUser.city,
                            county: parsedUser.county,
                            name: parsedUser.fullName || `${parsedUser.firstName} ${parsedUser.lastName}`,
                            location: parsedUser.address || parsedUser.city,
                            avatar: parsedUser.avatar || 'profile.png',
                        }));
                        setIsSignedIn(true);
                    }
                }

                // Listen to Firebase auth state changes
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        if (!firebaseUser.emailVerified) {
                            // Force sign-out if email not verified
                            await AsyncStorage.removeItem('user');
                            setUserState(null);
                            setIsSignedIn(false);
                            setIsLoading(false);
                            return;
                        }

                        // User is signed in and verified, fetch their data from Firestore
                        try {
                            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                            if (userDoc.exists()) {
                                const userData = userDoc.data() as UserProfile;
                                setUserState(userData);
                                
                                // Save to local storage
                                await AsyncStorage.setItem('user', JSON.stringify(userData));
                                
                                // Update Redux store
                                dispatch(setUser({
                                    firstName: userData.firstName,
                                    lastName: userData.lastName,
                                    postcode: userData.postcode,
                                    address: userData.address,
                                    city: userData.city,
                                    county: userData.county,
                                    name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
                                    location: userData.address || userData.city,
                                    avatar: userData.avatar || 'profile.png',
                                }));
                                setIsSignedIn(true);
                            }
                        } catch (error) {
                            console.error('Error fetching user from Firestore:', error);
                        }
                    } else {
                        // User is signed out
                        setUserState(null);
                        setIsSignedIn(false);
                        await AsyncStorage.removeItem('user');
                    }
                    setIsLoading(false);
                });

                return unsubscribe;
            } catch (e) {
                console.error('Error in bootstrap:', e);
                setIsLoading(false);
            }
        };

        const unsubscribe = bootstrapAsync();
        return () => {
            unsubscribe?.then(unsub => unsub?.());
        };
    }, [dispatch]);

    const updateUser = async (userData: Partial<UserProfile>) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...userData };
        setUserState(updatedUser);
        
        try {
            // Save to local storage
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update Redux store
            dispatch(setUser({
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                postcode: updatedUser.postcode,
                address: updatedUser.address,
                city: updatedUser.city,
                county: updatedUser.county,
                name: updatedUser.fullName || `${updatedUser.firstName} ${updatedUser.lastName}`,
                location: updatedUser.address || updatedUser.city,
                avatar: updatedUser.avatar || 'profile.png',
            }));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const logout = async () => {
        try {
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
            setUserState(null);
            setIsSignedIn(false);
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isSignedIn, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
