import * as React from 'react';
import { View, Pressable, StyleSheet, Text, Image } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

const clientId = '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'; // Substitua pelo seu Client ID do Google Cloud Console

export default function Login() {
  
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };


  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri: makeRedirectUri({
        native: 'https://auth.expo.io/@your-username/your-app-slug', 
      }),
      scopes: ['profile', 'email'],
    },
    discovery 
  );

  const handleGoogleLogin = async () => {
    if (request) {
      try {
        const result = await promptAsync();
        if (result.type === 'success') {
          console.log('Usuário conectado:', result.authentication);
          router.replace('home');
        } else {
          console.log('Erro ao fazer login:', result);
        }
      } catch (error) {
        console.error('Erro ao fazer login com Google:', error);
      }
    } else {
      console.log('Requisição ainda não carregada.');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={[tw``, { width: 150, height: 150 }]} 
        resizeMode="contain" 
      />

      <Pressable
        style={[
          styles.googleButton,
          { backgroundColor: request ? '#FF6F20' : '#A9A9A9' }, // Botão desabilitado se request for null
        ]}
        onPress={handleGoogleLogin}
        disabled={!request} // Desabilita o botão se a requisição não estiver pronta
      >
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#202020',
  },
  googleButton: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
