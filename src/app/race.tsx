import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Image, 
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import RankingList from '../funçoes/RankingList';
import MapComponent from '../funçoes/MapComponent';
import Chronometer from '../funçoes/cronometro'; 

const { width, height } = Dimensions.get('window');

interface Runner {
  id: number;
  name: string;
  time: string;
}

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

const RaceDashboard = () => {
  const router = useRouter();
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<RouteCoordinate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [runners, setRunners] = useState<Runner[]>([
    { id: 1, name: 'CORREDOR 1', time: "" },
    { id: 2, name: 'CORREDOR 2', time: "" },
    { id: 3, name: 'CORREDOR 3', time: "" },
    { id: 4, name: 'CORREDOR 4', time: "" },
    { id: 5, name: 'CORREDOR 5', time: "" },
    { id: 6, name: 'CORREDOR 6', time: "" },
  ]);

  // Função para salvar o percurso e navegar para a página de histórico
  const saveRaceAndNavigate = () => {
    Alert.alert(
      "Salvar Corrida",
      "Deseja salvar esta corrida?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Salvar", 
          onPress: () => {
            // Aqui você pode implementar a lógica para salvar o percurso
            // Por exemplo, usando AsyncStorage ou uma chamada de API
            
            const raceData = {
              date: new Date().toLocaleDateString(),
              distance: totalDistance.toFixed(1),
              duration: currentTime,
              avgSpeed: currentSpeed.toFixed(1),
              route: route
            };
            
            console.log("Dados da corrida salvos:", raceData);
            
            // Limpar a assinatura de localização antes de navegar
            if (locationSubscription.current) {
              locationSubscription.current.remove();
              locationSubscription.current = null;
            }
            
            // Navegar para a tela de histórico
            router.push('/history');
          }
        }
      ]
    );
  };

  // Função para lidar com o botão de voltar
  const handleGoBack = () => {
    if (isTracking) {
      Alert.alert(
        "Encerrar corrida",
        "Deseja realmente sair da corrida atual? Os dados não serão salvos.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          { 
            text: "Sair", 
            onPress: () => {
              if (locationSubscription.current) {
                locationSubscription.current.remove();
              }
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const updateRunnerTime = (time: string) => {
    setCurrentTime(time);
    // Atualizar o tempo do primeiro corredor como exemplo
    setRunners(prevRunners => {
      const newRunners = [...prevRunners];
      newRunners[0] = { ...newRunners[0], time };
      return newRunners;
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  };

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização.');
      return;
    }

    setIsTracking(true);

    // Certifique-se de parar qualquer assinatura anterior
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation: Location.LocationObject) => {
        // Calcular velocidade em km/h
        const speedKmh = newLocation.coords.speed
          ? (newLocation.coords.speed * 3.6).toFixed(1)
          : '0';
        setCurrentSpeed(parseFloat(speedKmh));

        // Atualizar rota
        setRoute(prevRoute => [
          ...prevRoute,
          {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          }
        ]);

        if (lastLocationRef.current) {
          const distance = calculateDistance(
            lastLocationRef.current.coords.latitude,
            lastLocationRef.current.coords.longitude,
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
          
          if (distance > 0.001) { // Ignorar distâncias menores que 1 metro
            setTotalDistance(prevDistance => prevDistance + distance);
          }
        }

        setLocation(newLocation);
        lastLocationRef.current = newLocation;
      }
    );
  };

  // Alert ao abrir a tela, perguntando se deseja iniciar a corrida
  useEffect(() => {
    Alert.alert(
      "Iniciar Corrida",
      "Deseja iniciar a corrida agora?",
      [
        {
          text: "Não",
          style: "cancel",
          onPress: () => router.back() // Voltar se o usuário não quiser iniciar
        },
        { 
          text: "Sim", 
          onPress: startTracking // Iniciar tracking se o usuário confirmar
        }
      ]
    );

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []); 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#121212']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CORRIDA ATUAL</Text>
          <View style={styles.headerRight}>
            {/* Botão modificado para salvar corrida */}
            <TouchableOpacity 
              style={styles.statusIndicator}
              onPress={saveRaceAndNavigate}
              activeOpacity={0.7}
            >
              <FontAwesome name="save" size={14} color="#FF6F20" style={{marginRight: 6}} />
              <Text style={styles.statusText}>SALVAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          {/* Current Speed */}
          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>SPEED</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{currentSpeed}</Text>
              <Text style={styles.statUnit}>KM/H</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="tachometer" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          {/* Distance */}
          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>DISTANCE</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.statUnit}>KM</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="road" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          {/* Current Time */}
          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>TIME</Text>
            <View style={styles.chronometerContainer}>
              <Chronometer 
                isActive={isTracking}
                onTimeUpdate={updateRunnerTime}
              />
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="clock-o" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.mapContainer}>
          <MapComponent 
            location={location}
            route={route}
            isTracking={isTracking}
            speed={currentSpeed}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.mapBadge}>
              <FontAwesome5 name="car-side" size={12} color="#FF6F20" />
              <Text style={styles.mapBadgeText}>RASTREAMENTO ATIVO</Text>
            </View>
          </View>
        </View>

        <View style={styles.rankingContainer}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingTitle}>CLASSIFICAÇÃO</Text>
            <View style={styles.rankingDivider} />
          </View>
          <RankingList runners={runners} />
        </View>

        <View style={styles.footer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 111, 32, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 111, 32, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6F20',
    marginRight: 6,
  },
  statusText: {
    color: '#FF6F20',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  statLabel: {
    color: '#FF6F20',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statUnit: {
    color: '#AAA',
    fontSize: 12,
  },
  statIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  chronometerContainer: {
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapBadgeText: {
    color: '#FF6F20',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rankingContainer: {
    height: height * 0.25,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    alignItems:'center'
  },
  rankingDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 111, 32, 0.3)',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  logo: {
    width: 40,
    height: 40,
    opacity: 0.8,
  },
});

export default RaceDashboard;
