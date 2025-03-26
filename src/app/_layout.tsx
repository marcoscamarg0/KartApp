import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("Erro ao buscar o token", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Erro ao salvar o token", err);
    }
  },
};

export default function Layout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="race" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  );
}