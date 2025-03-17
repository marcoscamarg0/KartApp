// src/app/home.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

export default function HomeScreen() {
  const router = useRouter();

  const handleNavigateToRace = () => {
    router.push("race"); 
  };

  return (
    <View style={styles.container}>
   
      <Image 
        source={require('../assets/logo.png')} 

        style={[tw``, { width: 150, height: 150 }]} 
        resizeMode="contain" 
      />
      <TouchableOpacity style={styles.button} onPress={handleNavigateToRace}>
        <Text style={styles.buttonText}>Ir para Corrida</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#202020',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6F20',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
