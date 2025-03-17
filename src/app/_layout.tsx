import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>

      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="race" options={{ headerShown: false  }} />
    </Stack>
  );
}
