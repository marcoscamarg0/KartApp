// src/funçoes/HistoryService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RaceHistoryEntry {
  id: string;
  date: string;
  circuitName: string;
  duration: string;
  distance: number;
  maxSpeed: number;
  avgSpeed: number;
  laps: number;
  position: number;
  totalParticipants: number;
  route: Array<{latitude: number, longitude: number}>;
}

class HistoryService {
  private static instance: HistoryService;
  private storageKey = '@kart_app_race_history';
  
  // Singleton pattern
  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }
  
  // Salvar uma corrida no histórico
  public async saveRace(race: RaceHistoryEntry): Promise<boolean> {
    try {
      // Obter o histórico atual
      const history = await this.getRaceHistory();
      
      // Adicionar a nova corrida
      history.unshift(race);
      
      // Salvar o histórico atualizado
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(history));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar corrida no histórico:', error);
      return false;
    }
  }
  
  // Obter todo o histórico de corridas
  public async getRaceHistory(): Promise<RaceHistoryEntry[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.storageKey);
      
      if (!historyJson) {
        return [];
      }
      
      return JSON.parse(historyJson) as RaceHistoryEntry[];
    } catch (error) {
      console.error('Erro ao obter histórico de corridas:', error);
      return [];
    }
  }
  
  // Obter uma corrida específica pelo ID
  public async getRaceById(raceId: string): Promise<RaceHistoryEntry | null> {
    try {
      const history = await this.getRaceHistory();
      const race = history.find(r => r.id === raceId);
      
      return race || null;
    } catch (error) {
      console.error('Erro ao obter corrida por ID:', error);
      return null;
    }
  }
  
  // Limpar todo o histórico
  public async clearHistory(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      return false;
    }
  }
}

export default HistoryService;