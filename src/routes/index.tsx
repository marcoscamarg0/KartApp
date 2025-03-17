// src/routes/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../app/login';
import HomeScreen from '../app/home';
import RaceDashboard from '../app/race';
import 'expo-router/entry';
// Definir os tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RaceDashboard: undefined;
};

// Criar o Stack Navigator com tipagem
const Stack = createStackNavigator<RootStackParamList>();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Home Screen' }} 
        />
        <Stack.Screen 
          name="RaceDashboard" 
          component={RaceDashboard} 
          options={{ title: 'Race Dashboard' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
