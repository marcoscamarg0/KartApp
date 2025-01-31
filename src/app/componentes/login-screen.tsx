import React from 'react';
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import tw from 'twrnc';
import { RootStackParamList } from '../app';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '64141712421-0ck032kn9nes6bl3kg0sdk68s6brb73s.apps.googleusercontent.com',
    
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      navigation.navigate('RaceDashboard');
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer login com o Google');
    }
  };

  return (
    <View style={tw`flex-1 bg-black items-center justify-center p-4`}>
      <View style={tw`items-center mb-12`}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={[tw``, { width: 200, height: 200 }]}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={tw`bg-white flex-row items-center justify-center rounded-full py-4 px-8 w-full max-w-xs`}
        onPress={handleGoogleLogin}
      >
        <Image
          source={require('../../assets/images/google-icon.png')}
          style={[tw`mr-4`, { width: 24, height: 24 }]}
          resizeMode="contain"
        />
        <Text style={tw`text-black text-lg font-semibold`}>
          Entrar com Google
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;