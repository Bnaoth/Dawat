import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#EA580C',
            headerShown: false,
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Eat",
                    tabBarIcon: ({ color }) => <Ionicons name="fast-food-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="kitchen"
                options={{
                    title: "Kitchen",
                    tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />
                }}
            />
        </Tabs>
    );
}
