// src/funçoes/TrackingService.ts
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

interface TrackingData {
  id: string;
  startPosition: {
    latitude: number;
    longitude: number;
  };
  currentPosition: {
    latitude: number;
    longitude: number;
  };
  route: Array<{
    latitude: number;
    longitude: number;
  }>;
  distance: number;
  lap: number;
  lapStartDistance: number;
  lastLapCheckpoint: {
    latitude: number;
    longitude: number;
  };
}

class TrackingService {
  private static instance: TrackingService;
  private trackingData: Map<string, TrackingData> = new Map();
  private readonly LAP_DISTANCE_THRESHOLD = 200; // Distância em metros para considerar uma volta completa
  private readonly LAP_PROXIMITY_THRESHOLD = 30; // Distância em metros para considerar próximo ao ponto inicial
  
  // Singleton pattern
  public static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }
  
  // Inicializar o rastreamento para um usuário
  public initializeTracking(
    userId: string, 
    initialPosition: { latitude: number; longitude: number }
  ): void {
    this.trackingData.set(userId, {
      id: userId,
      startPosition: { ...initialPosition },
      currentPosition: { ...initialPosition },
      route: [{ ...initialPosition }],
      distance: 0,
      lap: 1,
      lapStartDistance: 0,
      lastLapCheckpoint: { ...initialPosition },
    });
  }
  
  // Atualizar o rastreamento com uma nova posição
  public updateTracking(
    userId: string, 
    newPosition: { latitude: number; longitude: number }
  ): { distance: number; lap: number } {
    const data = this.trackingData.get(userId);
    
    if (!data) {
      console.error(`Dados de rastreamento não encontrados para o usuário ${userId}`);
      return { distance: 0, lap: 1 };
    }
    
    // Calcular a distância entre a posição atual e a nova posição
    const distanceDelta = getDistance(
      data.currentPosition,
      newPosition
    );
    
    // Atualizar a distância total
    data.distance += distanceDelta;
    
    // Atualizar a posição atual
    data.currentPosition = { ...newPosition };
    
    // Adicionar a nova posição à rota
    data.route.push({ ...newPosition });
    
    // Verificar se completou uma volta
    this.checkLapCompletion(data);
    
    return {
      distance: data.distance,
      lap: data.lap,
    };
  }
  
  // Verificar se o usuário completou uma volta
  private checkLapCompletion(data: TrackingData): void {
    // Distância desde o início da volta atual
    const distanceSinceLapStart = data.distance - data.lapStartDistance;
    
    // Distância até o ponto inicial
    const distanceToStart = getDistance(
      data.currentPosition,
      data.startPosition
    );
    
    // Distância até o último checkpoint de volta
    const distanceToLastCheckpoint = getDistance(
      data.currentPosition,
      data.lastLapCheckpoint
    );
    
    // Verificar se o usuário está próximo ao ponto inicial e percorreu uma distância mínima
    if (
      distanceToStart < this.LAP_PROXIMITY_THRESHOLD && 
      distanceSinceLapStart > this.LAP_DISTANCE_THRESHOLD &&
      distanceToLastCheckpoint > this.LAP_PROXIMITY_THRESHOLD * 2 // Evitar detecções duplicadas
    ) {
      // Incrementar o número de voltas
      data.lap += 1;
      
      // Atualizar a distância de início da volta
      data.lapStartDistance = data.distance;
      
      // Atualizar o último checkpoint de volta
      data.lastLapCheckpoint = { ...data.currentPosition };
    }
  }
  
  // Obter os dados de rastreamento de um usuário
  public getTrackingData(userId: string): TrackingData | undefined {
    return this.trackingData.get(userId);
  }
  
  // Limpar os dados de rastreamento de um usuário
  public clearTracking(userId: string): void {
    this.trackingData.delete(userId);
  }
}

export default TrackingService;