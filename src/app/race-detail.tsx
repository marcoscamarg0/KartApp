

// src/app/race-details.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import HistoryService, { RaceHistoryEntry } from '../funçoes/HistoryService';

const { width } = Dimensions.get('window');

export default function RaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const raceId = params.raceId as string;
  
  const [race, setRace] = useState<RaceHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  const historyService = HistoryService.getInstance();
  
  // Carregar os detalhes da corrida
  useEffect(() => {
    const loadRaceDetails = async () => {
      if (!raceId) {
        router.back();
        return;
      }
      
      setLoading(true);
      const raceDetails = await historyService.getRaceById(raceId);
      
      if (!raceDetails) {
        router.back();
        return;
      }
      
      setRace(raceDetails);
      setLoading(false);
    };
    
    loadRaceDetails();
  }, [raceId, router]);
  
  if (!race) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#1A1A1A', '#121212']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando detalhes...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Calcular a região do mapa para mostrar toda a rota
  const getMapRegion = () => {
    if (!race || !race.route || race.route.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    let minLat = race.route[0].latitude;
    let maxLat = race.route[0].latitude;
    let minLng = race.route[0].longitude;
    let maxLng = race.route[0].longitude;
    
    race.route.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });
    
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;
    
    return {
      latitude: (maxLat + minLat) / 2,
      longitude: (maxLng + minLng) / 2,
      latitudeDelta: Math.max(0.01, latDelta),
      longitudeDelta: Math.max(0.01, lngDelta),
    };
  };
  
  // Formatar a data
  const formattedDate = new Date(race.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#121212']}
        style={styles.background}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Detalhes da Corrida</Text>
          
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Informações básicas */}
          <View style={styles.infoCard}>
            <Text style={styles.circuitName}>{race.circuitName}</Text>
            <Text style={styles.raceDate}>{formattedDate}</Text>
            
            <View style={styles.positionContainer}>
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>
                  {race.position}º Lugar
                </Text>
              </View>
              <Text style={styles.totalParticipants}>
                de {race.totalParticipants} participantes
              </Text>
            </View>
          </View>
          
          {/* Mapa com a rota */}
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={getMapRegion()}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {race.route && race.route.length > 1 && (
 <Polyline
 coordinates={race.route}
 strokeColor="#FF6F20"
 strokeWidth={4}
 lineDashPattern={[0]}
/>
)}
</MapView>
</View>
{/* Estatísticas da corrida */}
<View style={styles.statsContainer}>
<View style={styles.statCard}>
<Ionicons name="time-outline" size={24} color="#FF6F20" />
<Text style={styles.statValue}>{race.duration}</Text>
<Text style={styles.statLabel}>Duração</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="map-outline" size={24} color="#FF6F20" />
<Text style={styles.statValue}>{(race.distance / 1000).toFixed(2)} km</Text>
<Text style={styles.statLabel}>Distância</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="speedometer-outline" size={24} color="#FF6F20" />
<Text style={styles.statValue}>{race.maxSpeed} km/h</Text>
<Text style={styles.statLabel}>Vel. Máxima</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="analytics-outline" size={24} color="#FF6F20" />
<Text style={styles.statValue}>{race.avgSpeed} km/h</Text>
<Text style={styles.statLabel}>Vel. Média</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="flag-outline" size={24} color="#FF6F20" />
<Text style={styles.statValue}>{race.laps}</Text>
<Text style={styles.statLabel}>Voltas</Text>
</View>
</View>

{/* Botão para compartilhar */}
<TouchableOpacity style={styles.shareButton}>
<Ionicons name="share-social-outline" size={20} color="#FFF" />
<Text style={styles.shareButtonText}>Compartilhar Resultado</Text>
</TouchableOpacity>
</ScrollView>
</LinearGradient>
</SafeAreaView>
);
}

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
},
headerRight: {
width: 40,
},
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
loadingText: {
color: '#AAA',
fontSize: 16,
},
scrollContent: {
padding: 16,
paddingBottom: 32,
},
infoCard: {
backgroundColor: 'rgba(255, 255, 255, 0.05)',
borderRadius: 12,
padding: 16,
marginBottom: 16,
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
circuitName: {
color: '#FFF',
fontSize: 20,
fontWeight: 'bold',
marginBottom: 4,
},
raceDate: {
color: '#AAA',
fontSize: 14,
marginBottom: 12,
},
positionContainer: {
flexDirection: 'row',
alignItems: 'center',
},
positionBadge: {
backgroundColor: 'rgba(255, 111, 32, 0.15)',
paddingVertical: 4,
paddingHorizontal: 8,
borderRadius: 4,
marginRight: 8,
},
positionText: {
color: '#FF6F20',
fontSize: 14,
fontWeight: 'bold',
},
totalParticipants: {
color: '#AAA',
fontSize: 12,
},
mapContainer: {
height: 200,
borderRadius: 12,
overflow: 'hidden',
marginBottom: 16,
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
map: {
...StyleSheet.absoluteFillObject,
},
statsContainer: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
marginBottom: 24,
},
statCard: {
backgroundColor: 'rgba(255, 255, 255, 0.05)',
borderRadius: 12,
padding: 16,
width: '48%',
marginBottom: 12,
alignItems: 'center',
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
statValue: {
color: '#FFF',
fontSize: 18,
fontWeight: 'bold',
marginTop: 8,
marginBottom: 4,
},
statLabel: {
color: '#AAA',
fontSize: 12,
},
shareButton: {
backgroundColor: '#FF6F20',
borderRadius: 12,
paddingVertical: 16,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
},
shareButtonText: {
color: '#FFF',
fontSize: 16,
fontWeight: 'bold',
marginLeft: 8,
},
});