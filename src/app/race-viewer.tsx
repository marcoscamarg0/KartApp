import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Image, 
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RankingList from '../funçoes/RankingList';
import MapComponent from '../funçoes/MapComponent';
import * as AsyncStorage from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

const RaceViewer = () => {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const [route, setRoute] = useState<RouteCoordinate[]>([]);
  const [location, setLocation] = useState<any>(null);

  // Carregar dados da sessão e atualizar em tempo real
  useEffect(() => {
    if (!sessionId) {
      router.back();
      return;
    }

    const loadSessionData = async () => {
      try {
        const sessionData = await AsyncStorage.getItemAsync(`race_session_${sessionId}`);
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          setRoute(parsedData.coordinates || []);
          if (parsedData.coordinates && parsedData.coordinates.length > 0) {
            setLocation({
              coords: parsedData.coordinates[parsedData.coordinates.length - 1],
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados da sessão:', error);
      }
    };

    loadSessionData();

    const interval = setInterval(loadSessionData, 1000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleGoBack = () => {
    router.back();
  };

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
          <Text style={styles.headerTitle}>VISUALIZAR CORRIDA</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.statusIndicator}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <FontAwesome name="history" size={14} color="#FF6F20" style={{marginRight: 6}} />
              <Text style={styles.statusText}>HISTÓRICO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>SPEED</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>N/A</Text>
              <Text style={styles.statUnit}>KM/H</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="tachometer" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>DISTANCE</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>N/A</Text>
              <Text style={styles.statUnit}>KM</Text>
            </View>
            <View style={styles.statIconContainer}>
              <FontAwesome name="road" size={16} color="#FF6F20" />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#1E1E1E', '#262626']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>TIME</Text>
            <View style={styles.chronometerContainer}>
              <Text style={styles.statValue}>N/A</Text>
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
            isTracking={false}
            speed={0}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.mapBadge}>
              <FontAwesome5 name="eye" size={12} color="#FF6F20" />
              <Text style={styles.mapBadgeText}>MODO VISUALIZADOR</Text>
            </View>
          </View>
        </View>

        <View style={styles.rankingContainer}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingTitle}>CLASSIFICAÇÃO</Text>
            <View style={styles.rankingDivider} />
          </View>
          <RankingList runners={[]} />
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
    alignItems: 'center'
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

export default RaceViewer;