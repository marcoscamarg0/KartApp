import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#202020' }}>
        <ActivityIndicator size="large" color="#FF6F20" />
      </View>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}