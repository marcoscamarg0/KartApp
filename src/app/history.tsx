
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  FlatList, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import HistoryService, { RaceHistoryEntry } from '../funçoes/HistoryService';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<RaceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const historyService = HistoryService.getInstance();
  
  // Carregar o histórico de corridas
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const raceHistory = await historyService.getRaceHistory();
      setHistory(raceHistory);
      setLoading(false);
    };
    
    loadHistory();
  }, []);
  
  // Limpar o histórico
  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de corridas? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            const success = await historyService.clearHistory();
            if (success) {
              setHistory([]);
            } else {
              Alert.alert('Erro', 'Não foi possível limpar o histórico.');
            }
          }
        }
      ]
    );
  };
  
  // Renderizar um item do histórico
  const renderHistoryItem = ({ item }: { item: RaceHistoryEntry }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => router.push({
          pathname: '/race-details',
          params: { raceId: item.id }
        })}
      >
        <View style={styles.historyItemHeader}>
          <Text style={styles.historyItemTitle}>{item.circuitName}</Text>
          <Text style={styles.historyItemDate}>{formattedDate}</Text>
        </View>
        
        <View style={styles.historyItemStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#AAA" />
            <Text style={styles.statValue}>{item.duration}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="speedometer-outline" size={16} color="#AAA" />
            <Text style={styles.statValue}>{item.maxSpeed} km/h</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="map-outline" size={16} color="#AAA" />
            <Text style={styles.statValue}>{(item.distance / 1000).toFixed(2)} km</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={16} color="#AAA" />
            <Text style={styles.statValue}>{item.laps} voltas</Text>
          </View>
        </View>
        
        <View style={styles.historyItemFooter}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {item.position}º de {item.totalParticipants}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#AAA" />
        </View>
      </TouchableOpacity>
    );
  };
  
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
>
  <Ionicons name="arrow-back" size={24} color="#FFF" />
</TouchableOpacity>

<Text style={styles.headerTitle}>Histórico de Corridas</Text>

<TouchableOpacity 
  style={styles.clearButton}
  onPress={handleClearHistory}
>
  <Ionicons name="trash-outline" size={22} color="#FF6F20" />
</TouchableOpacity>
</View>

{/* Lista de corridas */}
<FlatList
data={history}
renderItem={renderHistoryItem}
keyExtractor={(item) => item.id}
contentContainerStyle={styles.listContent}
ListEmptyComponent={
  <View style={styles.emptyContainer}>
    <Ionicons name="flag-outline" size={60} color="#333" />
    <Text style={styles.emptyTitle}>
      Nenhuma corrida encontrada
    </Text>
    <Text style={styles.emptySubtitle}>
      Suas corridas concluídas aparecerão aqui.
    </Text>
  </View>
}
/>
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
clearButton: {
padding: 8,
},
listContent: {
padding: 16,
paddingBottom: 32,
},
historyItem: {
backgroundColor: 'rgba(255, 255, 255, 0.05)',
borderRadius: 12,
padding: 16,
marginBottom: 16,
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.1)',
},
historyItemHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 12,
},
historyItemTitle: {
color: '#FFF',
fontSize: 16,
fontWeight: 'bold',
},
historyItemDate: {
color: '#AAA',
fontSize: 12,
},
historyItemStats: {
flexDirection: 'row',
flexWrap: 'wrap',
marginBottom: 12,
},
statItem: {
flexDirection: 'row',
alignItems: 'center',
width: '50%',
marginBottom: 8,
},
statValue: {
color: '#DDD',
fontSize: 14,
marginLeft: 6,
},
historyItemFooter: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingTop: 8,
borderTopWidth: 1,
borderTopColor: 'rgba(255, 255, 255, 0.05)',
},
positionBadge: {
backgroundColor: 'rgba(255, 111, 32, 0.15)',
paddingVertical: 4,
paddingHorizontal: 8,
borderRadius: 4,
},
positionText: {
color: '#FF6F20',
fontSize: 12,
fontWeight: 'bold',
},
emptyContainer: {
alignItems: 'center',
justifyContent: 'center',
paddingVertical: 60,
},
emptyTitle: {
color: '#FFF',
fontSize: 18,
fontWeight: 'bold',
marginTop: 16,
marginBottom: 8,
},
emptySubtitle: {
color: '#AAA',
fontSize: 14,
textAlign: 'center',
paddingHorizontal: 40,
},
});