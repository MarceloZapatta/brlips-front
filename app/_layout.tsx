import { Stack } from "expo-router";
import { AuthProvider } from "./contexts/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen
            name="history"
            options={{
              headerShown: true,
              headerTitle: "Predictions History",
            }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
