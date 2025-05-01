import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, 
         Dimensions, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface RaceDetail {
  id: string;
  date: string;
  time: string;
  distance: string;
  duration: string;
  avgSpeed: string;
  maxSpeed: string;
  bestLapTime: string;
  position: string;
  totalLaps: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
}

const RaceDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const raceDetail: RaceDetail = {
    id: '1',
    date: '15/04/2024',
    time: '14:30',
    distance: '5.2 km',
    duration: '28:15',
    avgSpeed: '55.8 km/h',
    maxSpeed: '68.3 km/h',
    bestLapTime: '01:02.345',
    position: '2º / 12',
    totalLaps: '15',
    coordinates: [
      { latitude: -23.550520, longitude: -46.633308 },
      { latitude: -23.552520, longitude: -46.635308 },
      { latitude: -23.554520, longitude: -46.636308 },
      { latitude: -23.556520, longitude: -46.638308 },
    ],
  };

  // Função para gerar QR Code e abrir modal
  const handleShare = () => {
    setLoading(true);
    setModalVisible(true);
  };

  // Dados para compartilhar
  const shareData = JSON.stringify({
    id: raceDetail.id,
    date: raceDetail.date,
    time: raceDetail.time,
    distance: raceDetail.distance,
    duration: raceDetail.duration,
    avgSpeed: raceDetail.avgSpeed,
    maxSpeed: raceDetail.maxSpeed,
    position: raceDetail.position,
    bestLapTime: raceDetail.bestLapTime,
    totalLaps: raceDetail.totalLaps
  });

  // URL do QR Code usando a API QRServer
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData)}`;

  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#121212']}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DETALHES DA CORRIDA</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.dateTimeContainer}>
            <LinearGradient
              colors={['rgba(255, 111, 32, 0.2)', 'rgba(255, 111, 32, 0.1)']}
              style={styles.dateTimeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.dateTimeItem}>
                <Ionicons name="calendar" size={18} color="#FF6F20" />
                <Text style={styles.dateTimeText}>{raceDetail.date}</Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Ionicons name="time" size={18} color="#FF6F20" />
                <Text style={styles.dateTimeText}>{raceDetail.time}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              customMapStyle={mapStyle}
              initialRegion={{
                latitude: raceDetail.coordinates[0].latitude,
                longitude: raceDetail.coordinates[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
            >
              <Polyline
                coordinates={raceDetail.coordinates}
                strokeColor="#FF6F20"
                strokeWidth={4}
                lineDashPattern={[0]}
                lineJoin="round"
              />
              
              <Marker
                coordinate={raceDetail.coordinates[0]}
                title="Início"
              >
                <View style={styles.startMarker}>
                  <Ionicons name="flag" size={14} color="#FFF" />
                </View>
              </Marker>
              
              <Marker
                coordinate={raceDetail.coordinates[raceDetail.coordinates.length - 1]}
                title="Fim"
              >
                <View style={styles.endMarker}>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </View>
              </Marker>
            </MapView>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <LinearGradient
                colors={['#222222', '#1A1A1A']}
                style={styles.statCard}
              >
                <Ionicons name="car-sport" size={22} color="#FF6F20" />
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{raceDetail.distance}</Text>
              </LinearGradient>
              
              <LinearGradient
                colors={['#222222', '#1A1A1A']}
                style={styles.statCard}
              >
                <Ionicons name="timer-outline" size={22} color="#FF6F20" />
                <Text style={styles.statLabel}>Duração</Text>
                <Text style={styles.statValue}>{raceDetail.duration}</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statsRow}>
              <LinearGradient
                colors={['#222222', '#1A1A1A']}
                style={styles.statCard}
              >
                <Ionicons name="speedometer-outline" size={22} color="#FF6F20" />
                <Text style={styles.statLabel}>Vel. Média</Text>
                <Text style={styles.statValue}>{raceDetail.avgSpeed}</Text>
              </LinearGradient>
              
              <LinearGradient
                colors={['#222222', '#1A1A1A']}
                style={styles.statCard}
              >
                <Ionicons name="flash-outline" size={22} color="#FF6F20" />
                <Text style={styles.statLabel}>Vel. Máxima</Text>
                <Text style={styles.statValue}>{raceDetail.maxSpeed}</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.kartSection}>
            <LinearGradient
              colors={['rgba(33, 150, 243, 0.15)', 'rgba(33, 150, 243, 0.05)']}
              style={styles.kartCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.kartHeader}>
                <Ionicons name="trophy-outline" size={22} color="#2196F3" />
                <Text style={styles.kartTitle}>Desempenho na Pista</Text>
              </View>
              
              <View style={styles.kartStats}>
                <View style={styles.kartStat}>
                  <Ionicons name="stopwatch-outline" size={20} color="#2196F3" />
                  <View>
                    <Text style={styles.kartStatLabel}>Melhor volta</Text>
                    <Text style={styles.kartStatValue}>{raceDetail.bestLapTime}</Text>
                  </View>
                </View>
                
                <View style={styles.kartStat}>
                  <Ionicons name="podium-outline" size={20} color="#2196F3" />
                  <View>
                    <Text style={styles.kartStatLabel}>Posição final</Text>
                    <Text style={styles.kartStatValue}>{raceDetail.position}</Text>
                  </View>
                </View>

                <View style={styles.kartStat}>
                  <Ionicons name="repeat" size={20} color="#2196F3" />
                  <View>
                    <Text style={styles.kartStatLabel}>Total de voltas</Text>
                    <Text style={styles.kartStatValue}>{raceDetail.totalLaps}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Botão único de compartilhamento */}
          <View style={styles.singleButtonContainer}>
            <TouchableOpacity 
              style={styles.shareFullButton}
              onPress={handleShare}
            >
              <LinearGradient
                colors={['#FF6F20', '#F44336']}
                style={styles.shareFullButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="share-social-outline" size={22} color="#FFF" />
                <Text style={styles.shareFullButtonText}>Compartilhar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Modal do QR Code */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Compartilhar corrida</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.qrCodeWrapper}>
                {loading ? (
                  <ActivityIndicator 
                    size="large" 
                    color="#FF6F20" 
                    style={{marginVertical: 70}} 
                    onLayout={() => setTimeout(() => setLoading(false), 1000)}
                  />
                ) : (
                  <Image 
                    source={{ uri: qrCodeUrl }}
                    style={styles.qrCode}
                    resizeMode="contain"
                  />
                )}
              </View>
              
              <Text style={styles.qrInstructions}>
                Escaneie este QR Code para compartilhar os detalhes desta corrida
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <LinearGradient
                  colors={['#FF6F20', '#F44336']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  shareButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateTimeContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  dateTimeGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mapContainer: {
    height: 220,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  startMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  endMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statsGrid: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: (width - 42) / 2,
    height: 90,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  kartSection: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
  },
  kartCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  kartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  kartTitle: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  kartStats: {
    gap: 12,
  },
  kartStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kartStatLabel: {
    color: '#AAA',
    fontSize: 13,
    marginLeft: 12,
  },
  kartStatValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  // Novo estilo para o botão de compartilhamento único
  singleButtonContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  shareFullButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareFullButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  shareFullButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  logo: {
    width: 80,
    height: 36,
    opacity: 0.8,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: width * 0.65,
    height: width * 0.65,
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  qrInstructions: {
    color: '#CCC',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 25,
    fontSize: 15,
    lineHeight: 22,
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 5,
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RaceDetailScreen;
