import { FontAwesome } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');
const qrSize = width * 0.7;

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const qrCodeLock = useRef(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;
  
  // Solicitar permissão da câmera e iniciar animação ao carregar
  useEffect(() => {
    requestPermission();
    startScanAnimation();
  }, []);

  // Animar a linha de escaneamento
  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Processar o QR Code lido
  const handleQRCodeRead = ({ data }) => {
    if (!qrCodeLock.current) {
      qrCodeLock.current = true;
      
      try {
        console.log("QR Code lido:", data);
        
        // Navegar para a página de corrida como usuário 2
        router.push({
          pathname: "/race",
          params: { 
            isUser2: true,
            joinRace: true,
            raceData: data
          }
        });
      } catch (error) {
        console.log("Erro ao processar QR Code:", error);
        
        // Resetar o bloqueio após alguns segundos
        setTimeout(() => {
          qrCodeLock.current = false;
        }, 2000);
      }
    }
  };

  // Animação da linha de escaneamento
  const translateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, qrSize],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.cameraContainer}>
        {permission?.granted ? (
          <CameraView
            facing="back"
            style={styles.camera}
            onBarcodeScanned={handleQRCodeRead}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
              style={styles.overlay}
            >
              <View style={styles.headerContainer}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <FontAwesome name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>ESCANEAR CORRIDA</Text>
              </View>

              <View style={styles.scannerContainer}>
                <View style={styles.qrFrame}>
                  {/* Corners of QR Frame */}
                  <View style={[styles.corner, styles.topLeftCorner]} />
                  <View style={[styles.corner, styles.topRightCorner]} />
                  <View style={[styles.corner, styles.bottomLeftCorner]} />
                  <View style={[styles.corner, styles.bottomRightCorner]} />
                  
                  {/* Scanning line */}
                  <Animated.View 
                    style={[
                      styles.scanLine,
                      {
                        transform: [{ translateY }]
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  Aponte para o QR Code do organizador da corrida
                </Text>
              </View>
            </LinearGradient>
          </CameraView>
        ) : (
          <View style={styles.permissionContainer}>
            <FontAwesome name="camera" size={50} color="#FF6F20" />
            <Text style={styles.permissionTitle}>
              Precisamos de acesso à câmera
            </Text>
            <Text style={styles.permissionText}>
              Para escanear o QR Code da corrida, permita o uso da sua câmera.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <LinearGradient
                colors={['#FF8F50', '#FF6F20', '#E85D10']}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>PERMITIR ACESSO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 111, 32, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    width: qrSize,
    height: qrSize,
    borderRadius: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF6F20',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF6F20',
    opacity: 0.8,
    shadowColor: "#FF6F20",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 32, 0.3)',
  },
  instructionsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Estilos para solicitação de permissão
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    color: '#AAA',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
