    // src/funçoes/RaceDataService.ts
import { nanoid } from 'nanoid';
import * as Location from 'expo-location';

export interface Runner {
  id: string;
  name: string;
  speed: number;
  distance: number;
  lap: number;
  time: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Circuit {
  id: string;
  name: string;
  hostId: string;
  runners: Runner[];
  createdAt: number;
}

class RaceDataService {
  private static instance: RaceDataService;
  private circuits: Map<string, Circuit> = new Map();
  private listeners: Map<string, Set<(circuit: Circuit) => void>> = new Map();
  
  // Singleton pattern
  public static getInstance(): RaceDataService {
    if (!RaceDataService.instance) {
      RaceDataService.instance = new RaceDataService();
    }
    return RaceDataService.instance;
  }
  
  // Criar um novo circuito
  public async createCircuit(userId: string, name: string): Promise<string> {
    // Gerar um ID único para o circuito
    const circuitId = nanoid(8);
    
    // Obter a localização atual do usuário
    let location;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
    
    // Criar o objeto do circuito
    const circuit: Circuit = {
      id: circuitId,
      name,
      hostId: userId,
      runners: [{
        id: userId,
        name: 'Você (Anfitrião)',
        speed: 0,
        distance: 0,
        lap: 1,
        time: '00:00',
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        } : undefined
      }],
      createdAt: Date.now()
    };
    
    //// Armazenar o circuito
    this.circuits.set(circuitId, circuit);
    
    // Inicializar o conjunto de listeners para este circuito
    this.listeners.set(circuitId, new Set());
    
    return circuitId;
  }
  
  // Entrar em um circuito existente
  public async joinCircuit(circuitId: string, userId: string): Promise<boolean> {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    // Verificar se o usuário já está no circuito
    const existingRunner = circuit.runners.find(runner => runner.id === userId);
    if (existingRunner) {
      return true; // Usuário já está no circuito
    }
    
    // Obter a localização atual do usuário
    let location;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
    
    // Adicionar o usuário ao circuito
    circuit.runners.push({
      id: userId,
      name: `Piloto ${circuit.runners.length + 1}`,
      speed: 0,
      distance: 0,
      lap: 1,
      time: '00:00',
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : undefined
    });
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Atualizar a velocidade de um corredor
  public updateRunnerSpeed(circuitId: string, runnerId: string, speed: number): boolean {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    const runner = circuit.runners.find(r => r.id === runnerId);
    
    if (!runner) {
      console.error(`Corredor ${runnerId} não encontrado no circuito ${circuitId}`);
      return false;
    }
    
    runner.speed = speed;
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Atualizar a distância de um corredor
  public updateRunnerDistance(circuitId: string, runnerId: string, distance: number): boolean {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    const runner = circuit.runners.find(r => r.id === runnerId);
    
    if (!runner) {
      console.error(`Corredor ${runnerId} não encontrado no circuito ${circuitId}`);
      return false;
    }
    
    runner.distance = distance;
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Atualizar a volta de um corredor
  public updateRunnerLap(circuitId: string, runnerId: string, lap: number): boolean {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    const runner = circuit.runners.find(r => r.id === runnerId);
    
    if (!runner) {
      console.error(`Corredor ${runnerId} não encontrado no circuito ${circuitId}`);
      return false;
    }
    
    runner.lap = lap;
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Atualizar o tempo de um corredor
  public updateRunnerTime(circuitId: string, runnerId: string, time: string): boolean {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    const runner = circuit.runners.find(r => r.id === runnerId);
    
    if (!runner) {
      console.error(`Corredor ${runnerId} não encontrado no circuito ${circuitId}`);
      return false;
    }
    
    runner.time = time;
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Atualizar a localização de um corredor
  public updateRunnerLocation(
    circuitId: string, 
    runnerId: string, 
    location: { latitude: number; longitude: number }
  ): boolean {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return false;
    }
    
    const runner = circuit.runners.find(r => r.id === runnerId);
    
    if (!runner) {
      console.error(`Corredor ${runnerId} não encontrado no circuito ${circuitId}`);
      return false;
    }
    
    runner.location = location;
    
    // Notificar os listeners sobre a atualização
    this.notifyListeners(circuitId);
    
    return true;
  }
  
  // Obter um circuito pelo ID
  public getCircuit(circuitId: string): Circuit | undefined {
    return this.circuits.get(circuitId);
  }
  
  // Obter todos os circuitos
  public getAllCircuits(): Circuit[] {
    return Array.from(this.circuits.values());
  }
  
  // Inscrever-se para receber atualizações de um circuito
  public subscribeToUpdates(
    circuitId: string, 
    callback: (circuit: Circuit) => void
  ): () => void {
    const circuit = this.circuits.get(circuitId);
    
    if (!circuit) {
      console.error(`Circuito ${circuitId} não encontrado`);
      return () => {};
    }
    
    let listeners = this.listeners.get(circuitId);
    
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(circuitId, listeners);
    }
    
    listeners.add(callback);
    
    // Chamar o callback imediatamente com o estado atual
    callback(circuit);
    
    // Retornar uma função para cancelar a inscrição
    return () => {
      const listeners = this.listeners.get(circuitId);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }
  
  // Notificar todos os listeners sobre uma atualização
  private notifyListeners(circuitId: string): void {
    const circuit = this.circuits.get(circuitId);
    const listeners = this.listeners.get(circuitId);
    
    if (circuit && listeners) {
      listeners.forEach(callback => {
        try {
          callback(circuit);
        } catch (error) {
          console.error('Erro ao notificar listener:', error);
        }
      });
    }
  }
  
  // Limpar recursos ao sair de um circuito
  public cleanUp(circuitId: string): void {
    this.listeners.delete(circuitId);
    // Não removemos o circuito para que outros usuários possam continuar usando
  }
}

export default RaceDataService;