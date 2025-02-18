import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';

import { NavigationProp } from '@react-navigation/native';

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Simula delay de requisição
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verifica se as credenciais são admin/admin
      if (username === 'admin' && password === 'admin') {
        navigation.navigate('Race'); // usando navigate para não permitir voltar
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../assets/logo.png')} // Substitua pelo caminho da sua logo
      />
      
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[
          styles.button,
          loading && styles.buttonDisabled
        ]}
        onPress={handleLogin}
        disabled={loading || !username || !password}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Carregando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      {/* Dica de login para desenvolvimento */}
      <Text style={styles.hint}>
        Dica: use admin/admin
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 50
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#cccccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  hint: {
    marginTop: 20,
    color: '#666',
    fontSize: 14
  }
});

export default LoginScreen;