import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

//configuraçao tokenkkk
const tokenCache = {
  //token armazenado
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("Erro ao buscar o token", err);
      return null;
    }
  },
  // salvar token
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Erro ao salvar o token", err);
    }
  },
};

// layout da aplicaçao e onde o clerk eh configurado
export default function Layout() {
  return (
    // Provider de autenticação do Clerk
    <ClerkProvider
      // Chave pública do Clerk obtida das variáveis de ambiente
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      // Cache
      tokenCache={tokenCache}
    >
      {/* configuraçao do router, (geralmente pra nao ficar o header branco feio) */}
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="race-detail" options={{ headerShown: false }} />
        <Stack.Screen name="race" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  );
}