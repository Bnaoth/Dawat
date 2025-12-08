import { Redirect } from "expo-router";

export default function Index() {
    // Redirect to login initially
    return <Redirect href="/(auth)/login" />;
}
