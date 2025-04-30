// src/funçoes/ShareService.ts
import { Share, Platform } from 'react-native';
import { RaceHistoryEntry } from './HistoryService';

class ShareService {
  private static instance: ShareService;
  
  // Singleton pattern
  public static getInstance(): ShareService {
    if (!ShareService.instance) {
      ShareService.instance = new ShareService();
    }
    return ShareService.instance;
  }
  
  // Compartilhar os resultados de uma corrida
  public async shareRaceResults(race: RaceHistoryEntry): Promise<boolean> {
    try {
      const formattedDate = new Date(race.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      
      const message = `
🏎️ Corrida de Kart - ${race.circuitName}
📅 ${formattedDate}
🏁 ${race.position}º lugar de ${race.totalParticipants} participantes
⏱️ Tempo: ${race.duration}
🛣️ Distância: ${(race.distance / 1000).toFixed(2)} km
🚀 Velocidade máxima: ${race.maxSpeed} km/h
📊 Velocidade média: ${race.avgSpeed} km/h
🔄 Voltas completadas: ${race.laps}

Compartilhado via Kart Tracker App
      `.trim();
      
      const result = await Share.share({
        message,
        title: 'Resultados da Corrida de Kart',
      });
      
      return result.action !== Share.dismissedAction;
    } catch (error) {
      console.error('Erro ao compartilhar resultados:', error);
      return false;
    }
  }
  
  // Compartilhar um convite para uma corrida
  public async shareRaceInvitation(circuitId: string, circuitName: string): Promise<boolean> {
    try {
      // URL para juntar-se à corrida (deeplink)
      const joinUrl = Platform.select({
        ios: `karttracker://race?mode=join&circuitId=${circuitId}`,
        android: `karttracker://race?mode=join&circuitId=${circuitId}`,
        default: `https://karttracker.app/race?mode=join&circuitId=${circuitId}`,
      });
      
      const message = `
🏎️ Convite para Corrida de Kart
🏁 Circuito: ${circuitName}
🔗 Clique no link para participar: ${joinUrl}

Enviado via Kart Tracker App
      `.trim();
      
      const result = await Share.share({
        message,
        title: 'Convite para Corrida de Kart',
        url: joinUrl,
      });
      
      return result.action !== Share.dismissedAction;
    } catch (error) {
      console.error('Erro ao compartilhar convite:', error);
      return false;
    }
  }
}

export default ShareService;