import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useSignIn, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ClerkAuthService } from "../funçoes/clerkAuthService";
import NetInfo from "@react-native-community/netinfo";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const { signIn } = useSignIn();
  const { isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      Alert.alert("Erro", "Serviço de login não disponível");
      return;
    }

    if (isOffline) {
      Alert.alert("Sem conexão", "Verifique sua conexão com a internet.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Iniciando autenticação...");
    setAuthFailed(false);
    WebBrowser.dismissBrowser();

    try {
      // Corrigindo a chamada para o ClerkAuthService
      const result = await ClerkAuthService.signInWithGoogle(signIn, router);
      if (result.success) {
        setLoadingMessage("Autenticação bem-sucedida!");
        setTimeout(() => {
          router.replace("/home");
        }, 1000);
      } else {
        setAuthFailed(true);
        Alert.alert("Erro de Login", result.error || "Erro desconhecido");
      }
    } catch (error) {
      setAuthFailed(true);
      Alert.alert("Erro", "Ocorreu um erro durante o login");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCancel = () => {
    WebBrowser.dismissBrowser();
    setIsLoading(false);
    setLoadingMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Você está offline</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        > 
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>A velocidade na palma da sua mão</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.formContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        > 
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
            onPress={handleGoogleSignIn} 
            disabled={isLoading || isOffline}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Image source={require("../assets/Google-icon.png")} style={styles.googleIcon} />
                <Text style={styles.buttonText}>Entrar com Google</Text>
              </>
            )}
          </TouchableOpacity>
          
          {authFailed && !isLoading && (
            <TouchableOpacity style={styles.retryButton} onPress={handleGoogleSignIn}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          )}
          
          {isLoading && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          
          {isLoading && loadingMessage && (
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
          )}
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.footerContainer, 
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.footerText}>© 2023 VTR Live Sport</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212" 
  },
  content: { 
    flexGrow: 1, 
    alignItems: "center", 
    justifyContent: "space-between",
    padding: 30 
  },
  logoContainer: { 
    alignItems: "center", 
    marginTop: height * 0.1,
    marginBottom: height * 0.05 
  },
  logo: { 
    width: width * 0.4, 
    height: width * 0.4,
    marginBottom: 20
  },
  subtitle: { 
    fontSize: 18, 
    color: "#A0A0A0",
    textAlign: "center",
    fontWeight: "400"
  },
  formContainer: { 
    width: "100%", 
    alignItems: "center",
    marginTop: height * 0.05
  },
  googleButton: { 
    flexDirection: "row", 
    backgroundColor: "#FF6F37", 
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center",
    width: "100%",
    elevation: 3,
    shadowColor: "#FF6F37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  buttonDisabled: {
    backgroundColor: "rgba(255, 111, 55, 0.6)",
    elevation: 0,
    shadowOpacity: 0
  },
  googleIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 12 
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  retryButton: { 
    marginTop: 20, 
    padding: 12, 
    alignItems: "center" 
  },
  retryButtonText: { 
    color: "#FF6F37", 
    textDecorationLine: "underline",
    fontSize: 16
  },
  cancelButton: { 
    marginTop: 20, 
    padding: 12, 
    alignItems: "center" 
  },
  cancelButtonText: { 
    color: "#A0A0A0",
    fontSize: 16
  },
  offlineBanner: { 
    backgroundColor: "#FF3B30", 
    padding: 10, 
    alignItems: "center",
    width: "100%"
  },
  offlineText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
  loadingMessage: {
    color: "#A0A0A0",
    marginTop: 20,
    textAlign: "center",
    fontSize: 14
  },
  footerContainer: {
    marginTop: height * 0.1,
    marginBottom: 20
  },
  footerText: {
    color: "#555",
    fontSize: 12
  }
});