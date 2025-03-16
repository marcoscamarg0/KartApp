import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable'; // Import correto
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../funçoes/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'SEU_CLIENT_ID',
    androidClientId: 'SEU_ANDROID_CLIENT_ID',
    iosClientId: 'SEU_IOS_CLIENT_ID',
    webClientId: 'SEU_WEB_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      if (response.authentication) {
        handleSignIn(response.authentication.accessToken);
      }
    }
  }, [response]);

  const handleSignIn = async (token: string) => {
    try {
      await signIn();
      router.replace('/(app)/home');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <View style={styles.container}>
  
      <Animatable.Text
        animation="zoomIn" // Nome da animação
        duration={3000} // Duração da animação em milissegundos
        style={styles.title}
      >
        KART APP
      </Animatable.Text>

      <Pressable
        style={styles.googleButton}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Animatable.Text animation="fadeIn" duration={800} style={styles.buttonText}>
          Entrar com Google
        </Animatable.Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#ffbc2b', 
  },
  googleButton: {
    backgroundColor: '#FF6F20', 
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
