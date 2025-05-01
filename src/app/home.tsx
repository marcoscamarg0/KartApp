import { useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Generate QR Code data
  const generateQRCode = (): string => {
    const raceData = {
      userId: 1,
      route: 'Route 1',
      startLocation: { latitude: 40.7128, longitude: -74.0060 },
      endLocation: { latitude: 40.7308, longitude: -73.9975 },
    };
    return JSON.stringify(raceData);
  };

  const handleNavigateToRace = (): void => {
    router.push("/race");
  };

  const handleNavigateToCamera = (): void => {
    console.log('Navigating to camera screen');
    router.push("/camera");
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert(
        'Logout Error',
        'Could not log out of account. Try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#121212']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerPattern}>
              {Array(5).fill(0).map((_, i) => (
                <View key={i} style={[styles.patternLine, { width: 20 + i * 15 }]} />
              ))}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Bem-vindo,</Text>
              <Text style={styles.welcomeName}>Piloto!</Text>
              <View style={styles.divider} />
              <Text style={styles.welcomeSubtitle}>Pronto para a próxima corrida?</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="flag" size={20} color="#FF6F20" />
                </View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Corridas</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trophy" size={20} color="#FF6F20" />
                </View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Vitórias</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="star" size={20} color="#FF6F20" />
                </View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Pontos</Text>
              </View>
            </View>

            <View style={styles.raceInfoContainer}>
              <LinearGradient
                colors={['#222222', '#1A1A1A']}
                style={styles.raceInfoCard}
              >
                <View style={styles.raceInfoHeader}>
                  <Text style={styles.raceInfoTitle}>Próxima Corrida</Text>
                  <View style={styles.raceStatusBadge}>
                    <Text style={styles.raceStatusText}>DISPONÍVEL</Text>
                  </View>
                </View>
                <View style={styles.raceInfoContent}>
                  <View style={styles.raceInfoItem}>
                    <Ionicons name="location" size={16} color="#AAA" />
                    <Text style={styles.raceInfoText}>Pista Principal</Text>
                  </View>
                  <View style={styles.raceInfoItem}>
                    <Ionicons name="time" size={16} color="#AAA" />
                    <Text style={styles.raceInfoText}>Duração: 10 min</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Seu QR Code</Text>
                <View style={styles.qrCodeBox}>
                  <QRCode value={generateQRCode()} size={150} />
                </View>
                <Text style={styles.qrSubtitle}>Compartilhe para corridas em grupo</Text>
              </View>
              
              <TouchableOpacity
                style={styles.scannerButton}
                onPress={handleNavigateToCamera}
              >
                <LinearGradient
                  colors={['#333333', '#222222']}
                  style={styles.scannerButtonGradient}
                >
                  <Ionicons name="scan" size={22} color="#FF6F20" />
                  <Text style={styles.scannerButtonText}>Escanear QR Code</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.raceButton}
              onPress={handleNavigateToRace}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF8F50', '#FF6F20', '#E85D10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>INICIAR CORRIDA</Text>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => router.push("/history")}
            >
              <Text style={styles.historyButtonText}>Ver histórico de corridas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.historyButton} onPress={handleLogout}>
              <Text style={styles.historyButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  headerPattern: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  patternLine: {
    height: 2,
    backgroundColor: 'rgba(255, 111, 32, 0.3)',
    marginBottom: 5,
    borderRadius: 1,
  },
  logo: {
    width: 120,
    height: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '400',
  },
  welcomeName: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: -5,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#FF6F20',
    borderRadius: 2,
    marginVertical: 15,
  },
  welcomeSubtitle: {
    color: '#BBB',
    fontSize: 16,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 111, 32, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#FF6F20',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#AAA',
    fontSize: 12,
  },
  raceInfoContainer: {
    marginBottom: 30,
  },
  raceInfoCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  raceInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  raceInfoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  raceStatusBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  raceStatusText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: 'bold',
  },
  raceInfoContent: {
    gap: 10,
  },
  raceInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  raceInfoText: {
    color: '#DDD',
    fontSize: 14,
  },
  // QR Code Styles
  qrSection: {
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#FF6F20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  qrSubtitle: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 12,
  },
  scannerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  scannerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 32, 0.3)',
  },
  scannerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  raceButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF6F20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 1,
  },
  historyButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyButtonText: {
    color: '#AAA',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;