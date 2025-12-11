import { createContext, useContext, useState, ReactNode } from 'react';

type UserProfile = {
    name: string;
    location: string;
    avatar: any; // Using require() for local assets
};

type AuthContextType = {
    user: UserProfile;
    updateUser: (name: string, location: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Mock default user - in a real app this would come from Firebase Auth
    const [user, setUser] = useState<UserProfile>({
        name: "Ganesh Banoth",
        location: "London, UK",
        avatar: require('../assets/images/profile.png') // Ensure this asset exists or use placeholder
    });

    const updateUser = (name: string, location: string) => {
        setUser(prev => ({ ...prev, name, location }));
    };

    return (
        <AuthContext.Provider value={{ user, updateUser }}>
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
