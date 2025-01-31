import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './componentes/login-screen';
import RaceDashboard from './screens/index';


export type RootStackParamList = {
  Login: undefined;
  RaceDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RaceDashboard" component={RaceDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}