import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; 

// back-end
interface Race {
  id: string;        // ID único da corrida no banco de dados
  date: string;      // data formatada (considerar enviar ISO date do backend)
  distance: string;  // distância total percorrida (em km)
  duration: string;  // duração total (formato HH:mm:ss)
  avgSpeed: string;  // velocidade média (km/h)
}

const HistoryScreen = () => {
  const router = useRouter();

  // substituir este array estático por uma chamada à API
  // considerar paginação com query params: ?page=1&limit=10
  const races: Race[] = [
    { id: '1', date: '15/04/2024', distance: '5.2 km', duration: '28:15', avgSpeed: '11.1 km/h' },
    { id: '2', date: '12/04/2024', distance: '3.8 km', duration: '21:40', avgSpeed: '10.5 km/h' },
    { id: '3', date: '08/04/2024', distance: '7.5 km', duration: '42:30', avgSpeed: '10.6 km/h' },
  ];

  // Handler para navegação ao detalhe da corrida
  // O ID será usado para buscar dados detalhados no backend
  const handleViewRace = (raceId: string) => {
    // TODO: Considerar pré-carregar dados via API
    // Endpoint sugerido: GET /api/races/{raceId}
    router.push(`/race-detail?id=${raceId}`);
  };

  // Renderiza cada item da lista de corridas
  // Os dados devem vir formatados do backend para exibição
  const renderRaceItem = ({ item }: { item: Race }) => (
    <TouchableOpacity 
      style={styles.raceItem} 
      onPress={() => handleViewRace(item.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#222222', '#1A1A1A']}
        style={styles.raceItemGradient}
      >
        <View style={styles.raceItemHeader}>
          <Text style={styles.raceDate}>{item.date}</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF6F20" />
        </View>
        <View style={styles.raceStats}>
          <View style={styles.statItem}>
        
            <FontAwesome5 name="car" size={16} color="#FF6F20" />
            <Text style={styles.statText}>{item.distance}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#FF6F20" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={16} color="#FF6F20" />
            <Text style={styles.statText}>{item.avgSpeed}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );


  // paginação infinita (carregar mais corridas ao rolar)
  // Pull to refresh para atualizar lista
  // Tratamento de estados de loading e erro
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
          <Text style={styles.headerTitle}>HISTÓRICO DE CORRIDAS</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={races}
          renderItem={renderRaceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

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
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  raceItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  raceItemGradient: {
    padding: 16,
  },
  raceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  raceDate: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  raceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#DDD',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logo: {
    width: 80,
    height: 40,
    opacity: 0.8,
  },
});

export default HistoryScreen;
