import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapComponent from '../funçoes/MapComponent';
import RankingList from '../funçoes/RankingList';
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

interface RaceData {
  id: string;
  date: string;
  distance: string;
  duration: string;
  avgSpeed: string;
  route: RouteCoordinate[];
}

const RaceDashboard = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isUser2 = params.isUser2 === 'true';
  const joinRace = params.joinRace === 'true';
  
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [locationUser1, setLocationUser1] = useState<Location.LocationObject | null>(null);
  const [locationUser2, setLocationUser2] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<RouteCoordinate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [runners, setRunners] = useState<Runner[]>([
    { id: 1, name: 'Usuário 1', time: "" },
  ]);

  // Função para salvar o percurso no AsyncStorage
  const saveRace = async (raceData: RaceData) => {
    try {
      // Buscar corridas salvas anteriormente
      const savedRacesJson = await AsyncStorage.getItem('savedRaces');
      const savedRaces: RaceData[] = savedRacesJson ? JSON.parse(savedRacesJson) : [];
      
      // Adicionar a nova corrida
      const updatedRaces = [...savedRaces, raceData];
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('savedRaces', JSON.stringify(updatedRaces));
      
      console.log('Corrida salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar corrida:', error);
      Alert.alert('Erro', 'Não foi possível salvar a corrida');
    }
  };

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
          onPress: async () => {
            const raceData = {
              id: Date.now().toString(),
              date: new Date().toLocaleDateString(),
              distance: totalDistance.toFixed(1),
              duration: currentTime,
              avgSpeed: currentSpeed.toFixed(1),
              route: route
            };
            
            await saveRace(raceData);
            
            if (locationSubscription.current) {
              locationSubscription.current.remove();
              locationSubscription.current = null;
            }
            
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
    setRunners(prevRunners => {
      return prevRunners.map(runner => {
        if (runner.id === 1 || (isUser2 && runner.id === 2)) {
          return { ...runner, time };
        }
        return runner;
      });
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
        const speedKmh = newLocation.coords.speed
          ? (newLocation.coords.speed * 3.6).toFixed(1)
          : '0';
        setCurrentSpeed(parseFloat(speedKmh));

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
          
          if (distance > 0.001) {
            setTotalDistance(prevDistance => prevDistance + distance);
          }
        }

        if (isUser2) {
          setLocationUser2(newLocation);
        } else {
          setLocationUser1(newLocation);
        }
        
        lastLocationRef.current = newLocation;
      }
    );
  };

  // Efeito para lidar com usuário 2 se juntando à corrida
  useEffect(() => {
    if (isUser2 && joinRace) {
      // Se for o usuário 2 se juntando, adicione-o à lista de corredores
      setRunners(prev => [...prev, { id: 2, name: 'Você (User 2)', time: "" }]);
      
      // Processar dados de corrida do QR code, se houver
      if (params.raceData) {
        try {
          const data = JSON.parse(params.raceData as string);
          console.log("Dados da corrida recebidos:", data);
          
          // Simular localização do usuário 1 com base nos dados recebidos
          if (data.route) {
            // Poderia configurar aqui dados recebidos do usuário 1
          }
        } catch (error) {
          console.log("Erro ao processar dados da corrida:", error);
        }
      }
    }
  }, [isUser2, joinRace, params.raceData]);

  useEffect(() => {
    if (!joinRace) {
      Alert.alert(
        "Iniciar Corrida",
        "Deseja iniciar a corrida agora?",
        [
          {
            text: "Não",
            style: "cancel",
            onPress: () => router.back()
          },
          { 
            text: "Sim", 
            onPress: startTracking
          }
        ]
      );
    } else {
      // Se estiver se juntando, iniciar tracking automaticamente
      startTracking();
    }

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
      <LinearGradient colors={['#1A1A1A', '#121212']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {joinRace ? "CORRIDA EM GRUPO" : "CORRIDA ATUAL"}
          </Text>
          <View style={styles.headerRight}>
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

        <View style={styles.statsContainer}>
          <LinearGradient colors={['#1E1E1E', '#262626']} style={styles.statCard}>
            <Text style={styles.statLabel}>SPEED</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{currentSpeed}</Text>
              <Text style={styles.statUnit}>KM/H</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="tachometer" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          <LinearGradient colors={['#1E1E1E', '#262626']} style={styles.statCard}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.statUnit}>KM</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="road" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          <LinearGradient colors={['#1E1E1E', '#262626']} style={styles.statCard}>
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
            locationUser1={locationUser1}
            locationUser2={locationUser2}
            route={route}
            isTracking={isTracking}
            speed={currentSpeed}
          />
          
          {joinRace && (
            <View style={styles.mapOverlay}>
              <View style={styles.mapBadge}>
                <FontAwesome name="users" size={12} color="#FF6F20" />
                <Text style={styles.mapBadgeText}>CORRIDA EM GRUPO</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.rankingContainer}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingTitle}>CLASSIFICAÇÃO</Text>
            <View style={styles.rankingDivider} />
          </View>
          <RankingList runners={runners} />
        </View>

        <View style={styles.footer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
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
    zIndex: 100,
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
