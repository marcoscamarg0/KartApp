import React, { useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const urlObj = new URL(url);
        const path = urlObj.pathname.replace(/^\//, '');
        const sessionId = urlObj.searchParams.get('sessionId');
        if (path === 'race' && sessionId) {
          router.push(`/race?sessionId=${sessionId}`);
        } else if (path === 'race-viewer' && sessionId) {
          router.push(`/race-viewer?sessionId=${sessionId}`);
        }
      }
    };
    handleDeepLink();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/^\//, '');
      const sessionId = urlObj.searchParams.get('sessionId');
      if (path === 'race' && sessionId) {
        router.push(`/race?sessionId=${sessionId}`);
      } else if (path === 'race-viewer' && sessionId) {
        router.push(`/race-viewer?sessionId=${sessionId}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="race-detail" options={{ headerShown: false }} />
        <Stack.Screen name="race" options={{ headerShown: false }} />
        <Stack.Screen name="race-viewer" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  );
}