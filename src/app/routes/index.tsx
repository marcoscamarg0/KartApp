import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

import LoginScreen from '../paginas/loginscreen';
import HomeScreen from '../paginas/HomeScreen';
import RaceDashboard from '../paginas/raceApp';

// Definindo os tipos para as rotas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RaceDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Routes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"  
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' }
        }}
      >
        {!isAuthenticated ? (
          
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="RaceDashboard" 
              component={RaceDashboard} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;