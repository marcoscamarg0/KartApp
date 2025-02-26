import { Stack } from 'expo-router';
import AuthProvider from './hooks/useAuth';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4f4f4',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Login' 
          }} 
        />
        {/* Adicione outras telas conforme necessário */}
      </Stack>
    </AuthProvider>
  );
}