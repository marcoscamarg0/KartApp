// src/app/race.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Modal,
  Alert,
  BackHandler
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import QRCodeGenerator from '../funçoes/QRCodeGenerator';
import RaceDataService from '../funçoes/RaceDataService';
import TrackingService from '../funçoes/TrackingService';

export default function race() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isJoining = params.mode === 'join';
  const joinCircuitId = params.circuitId as string;
  
  const [userId] = useState<string>(`user_${Date.now()}`);
  const [circuitId, setCircuitId] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [route, setRoute] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [runners, setRunners] = useState<Array<any>>([]);
  
  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const raceDataService = RaceDataService.getInstance();
  const trackingService = TrackingService.getInstance();
  
  // Inicializar o circuito
  useEffect(() => {
    const initializeCircuit = async () => {
      try {
        if (isJoining && joinCircuitId) {
          // Entrar em um circuito existente
          const success = await raceDataService.joinCircuit(joinCircuitId, userId);
          if (success) {
            setCircuitId(joinCircuitId);
            setIsHost(false);
          } else {
            Alert.alert('Erro', 'Não foi possível entrar no circuito.');
            router.back();
          }
        } else {
          // Criar um novo circuito
          const newCircuitId = await raceDataService.createCircuit(userId, 'Circuito de Kart');
          setCircuitId(newCircuitId);
          setIsHost(true);
        }
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao inicializar o circuito.');
        router.back();
      }
    };
    
    initializeCircuit();
    
    // Limpar recursos ao desmontar o componente
    return () => {
      if (circuitId) {
        raceDataService.cleanUp(circuitId);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isJoining, joinCircuitId, userId, router]);
  
  // Inscrever-se para atualizações do circuito
  useEffect(() => {
    if (circuitId) {
      raceDataService.subscribeToUpdates(circuitId, (circuit) => {
        setRunners(circuit.runners);
        
        // Encontrar o corredor atual
        const currentRunner = circuit.runners.find(r => r.id === userId);
        if (currentRunner) {
          setCurrentSpeed(currentRunner.speed);
          setCurrentDistance(currentRunner.distance);
          setCurrentLap(currentRunner.lap);
        }
      });
    }
  }, [circuitId, userId]);
  
  // Solicitar permissões de localização
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar a localização foi negada');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
      setLocation(location);
      
      if (location.coords) {
        const initialPosition = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        setRoute([initialPosition]);
        
        // Inicializar o serviço de rastreamento
        trackingService.initializeTracking(userId, initialPosition);
      }
    })();
  }, [userId]);
  
  // Iniciar ou parar o rastreamento
  const toggleTracking = async () => {
    if (isTracking) {
      // Parar o rastreamento
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;
      setIsTracking(false);
    } else {
      // Iniciar o rastreamento
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização.');
        return;
      }
      
      // Iniciar o cronômetro
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          const seconds = Math.floor((elapsed / 1000) % 60);
          const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
          const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
          
          setElapsedTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
          
          // Atualizar o tempo no serviço de dados
          if (circuitId) {
            raceDataService.updateRunnerTime(
              circuitId, 
              userId, 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
          }
        }
      }, 1000);
      
      // Iniciar o rastreamento de localização
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        (newLocation) => {
          setLocation(newLocation);
          
          if (newLocation.coords) {
            const position = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            };
            
            // Atualizar a rota
            setRoute(prevRoute => [...prevRoute, position]);
            
            // Atualizar o rastreamento
            const trackingData = trackingService.updateTracking(userId, position);
            
            // Atualizar a velocidade (km/h)
            const speedKmh = newLocation.coords.speed ? (newLocation.coords.speed * 3.6) : 0;
            setCurrentSpeed(parseFloat(speedKmh.toFixed(1)));
            
            // Atualizar a distância e a volta
            setCurrentDistance(trackingData.distance);
            setCurrentLap(trackingData.lap);
            
            // Atualizar os dados no serviço de dados
            if (circuitId) {
              raceDataService.updateRunnerDistance(circuitId, userId, trackingData.distance);
              raceDataService.updateRunnerLap(circuitId, userId, trackingData.lap);
            }
            
            // Centralizar o mapa na posição atual
            mapRef.current?.animateToRegion({
              latitude: position.latitude,
              longitude: position.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        }
      );
      
      setIsTracking(true);
    }
  };
  
  // Compartilhar o circuito via QR code
  const shareCircuit = () => {
    setShowQRCode(true);
  };
  
  // Manipular o botão voltar do Android
  useEffect(() => {
    const backAction = () => {
      if (isTracking) {
        Alert.alert(
          'Sair da corrida?',
          'Você está com uma corrida em andamento. Deseja realmente sair?',
          [


{ text: 'Não', onPress: () => null, style: 'cancel' },
{ 
  text: 'Sim', 
  onPress: () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.back();
  } 
}
]
);
return true;
}
return false;
};

const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

return () => backHandler.remove();
}, [isTracking, router]);

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
onPress={() => {
  if (isTracking) {
    Alert.alert(
      'Sair da corrida?',
      'Você está com uma corrida em andamento. Deseja realmente sair?',
      [
        { text: 'Não', onPress: () => null, style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            router.back();
          } 
        }
      ]
    );
  } else {
    router.back();
  }
}}
>
<Ionicons name="arrow-back" size={24} color="#FFF" />
</TouchableOpacity>

<Text style={styles.headerTitle}>Corrida de Kart</Text>

{isHost && (
<TouchableOpacity 
  style={styles.shareButton}
  onPress={shareCircuit}
>
  <FontAwesome name="qrcode" size={24} color="#FF6F20" />
</TouchableOpacity>
)}
</View>

{/* Informações principais */}
<View style={styles.infoContainer}>
<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Velocidade</Text>
<Text style={styles.infoValue}>{currentSpeed}<Text style={styles.infoUnit}> km/h</Text></Text>
</View>

<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Distância</Text>
<Text style={styles.infoValue}>{(currentDistance / 1000).toFixed(2)}<Text style={styles.infoUnit}> km</Text></Text>
</View>

<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Volta</Text>
<Text style={styles.infoValue}>{currentLap}</Text>
</View>
</View>

{/* Mapa */}
<View style={styles.mapContainer}>
{location ? (
<MapView
  ref={mapRef}
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={{
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  }}
  showsUserLocation
  showsCompass
  showsScale
  rotateEnabled
  loadingEnabled
>
  {/* Traçado da rota */}
  {route.length > 1 && (
    <Polyline
      coordinates={route}
      strokeColor="#FF6F20"
      strokeWidth={4}
      lineDashPattern={[0]}
    />
  )}
  
  {/* Marcadores para cada corredor */}
  {runners.map((runner) => {
    if (!runner.location) return null;
    
    return (
      <Marker
        key={runner.id}
        coordinate={{
          latitude: runner.location.latitude,
          longitude: runner.location.longitude,
        }}
        title={runner.name || 'Piloto'}
        description={`Velocidade: ${runner.speed} km/h`}
        pinColor={runner.id === userId ? '#FF6F20' : '#1E90FF'}
      />
    );
  })}
</MapView>
) : (
<View style={[styles.map, styles.loadingMap]}>
  <Text style={styles.loadingText}>
    {errorMsg || 'Carregando mapa...'}
  </Text>
</View>
)}
</View>

{/* Cronômetro e botão de controle */}
<View style={styles.controlContainer}>
<View style={styles.timerContainer}>
<Text style={styles.timerLabel}>Tempo</Text>
<Text style={styles.timerValue}>{elapsedTime}</Text>
</View>

<TouchableOpacity 
style={[
  styles.controlButton,
  isTracking ? styles.stopButton : styles.startButton
]}
onPress={toggleTracking}
>
<Text style={styles.controlButtonText}>
  {isTracking ? 'PARAR' : 'INICIAR'}
</Text>
</TouchableOpacity>
</View>

{/* Lista de corredores */}
<View style={styles.runnersContainer}>
<Text style={styles.runnersTitle}>Pilotos na Pista</Text>

{runners.length === 0 ? (
<Text style={styles.noRunnersText}>
  Nenhum piloto na pista ainda
</Text>
) : (
runners.map((runner, index) => (
  <View 
    key={runner.id} 
    style={[
      styles.runnerItem,
      runner.id === userId && styles.currentRunnerItem
    ]}
  >
    <Text style={styles.runnerPosition}>{index + 1}</Text>
    <Text style={styles.runnerName}>{runner.name || 'Piloto'}</Text>
    <Text style={styles.runnerLap}>Volta {runner.lap || 1}</Text>
    <Text style={styles.runnerTime}>{runner.time || '00:00'}</Text>
  </View>
))
)}
</View>

{/* Modal do QR Code */}
<Modal
visible={showQRCode}
transparent={true}
animationType="fade"
onRequestClose={() => setShowQRCode(false)}
>
<View style={styles.modalContainer}>
<View style={styles.modalContent}>
  <QRCodeGenerator 
    circuitId={circuitId}
    userId={userId}
  />
  <TouchableOpacity 
    style={styles.closeModalButton}
    onPress={() => setShowQRCode(false)}
  >
    <Text style={styles.closeModalButtonText}>FECHAR</Text>
  </TouchableOpacity>
</View>
</View>
</Modal>
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
shareButton: {
padding: 8,
},
infoContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
paddingHorizontal: 16,
paddingVertical: 16,
},
infoCard: {
backgroundColor: 'rgba(255, 255, 255, 0.05)',
borderRadius: 12,
padding: 12,
width: '30%',
alignItems: 'center',
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
infoLabel: {
color: '#AAA',
fontSize: 12,
marginBottom: 4,
},
infoValue: {
color: '#FF6F20',
fontSize: 20,
fontWeight: 'bold',
},
infoUnit: {
fontSize: 14,
fontWeight: 'normal',
},
mapContainer: {
height: '35%',
margin: 16,
borderRadius: 16,
overflow: 'hidden',
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
map: {
...StyleSheet.absoluteFillObject,
},
loadingMap: {
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#1E1E1E',
},
loadingText: {
color: '#AAA',
fontSize: 14,
},
controlContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: 16,
marginBottom: 16,
},
timerContainer: {
backgroundColor: 'rgba(255, 255, 255, 0.05)',
borderRadius: 12,
padding: 12,
width: '48%',
alignItems: 'center',
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
timerLabel: {
color: '#AAA',
fontSize: 12,
marginBottom: 4,
},
timerValue: {
color: '#FFF',
fontSize: 24,
fontWeight: 'bold',
},
controlButton: {
width: '48%',
paddingVertical: 16,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
},
startButton: {
backgroundColor: '#FF6F20',
},
stopButton: {
backgroundColor: '#E74C3C',
},
controlButtonText: {
color: '#FFF',
fontSize: 16,
fontWeight: 'bold',
},
runnersContainer: {
flex: 1,
backgroundColor: 'rgba(255, 255, 255, 0.05)',
marginHorizontal: 16,
marginBottom: 16,
borderRadius: 12,
padding: 12,
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
runnersTitle: {
color: '#FFF',
fontSize: 16,
fontWeight: 'bold',
marginBottom: 12,
},
noRunnersText: {
color: '#AAA',
fontSize: 14,
textAlign: 'center',
marginTop: 20,
},
runnerItem: {
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 8,
borderBottomWidth: 1,
borderBottomColor: 'rgba(255, 255, 255, 0.05)',
},
currentRunnerItem: {
backgroundColor: 'rgba(255, 111, 32, 0.1)',
borderRadius: 8,
paddingHorizontal: 8,
},
runnerPosition: {
color: '#FF6F20',
fontSize: 16,
fontWeight: 'bold',
width: 30,
},
runnerName: {
color: '#FFF',
fontSize: 14,
flex: 1,
},
runnerLap: {
color: '#AAA',
fontSize: 12,
marginRight: 12,
},
runnerTime: {
color: '#FFF',
fontSize: 14,
fontWeight: 'bold',
},
modalContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(0, 0, 0, 0.8)',
},
modalContent: {
backgroundColor: '#FFF',
borderRadius: 16,
padding: 20,
alignItems: 'center',
width: '80%',
},
closeModalButton: {
marginTop: 20,
backgroundColor: '#FF6F20',
paddingVertical: 12,
paddingHorizontal: 24,
borderRadius: 8,
},
closeModalButtonText: {
color: '#FFF',
fontSize: 14,
fontWeight: 'bold',
},
});