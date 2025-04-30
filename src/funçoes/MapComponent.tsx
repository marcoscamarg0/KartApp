import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Runner } from '../funçoes/RaceDataService';
import tw from 'twrnc';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  location: any;
  route: RouteCoordinate[];
  runners: Runner[];
  currentUserId: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ location, route, runners, currentUserId }) => {
  // Encontrar o corredor atual para centralizar o mapa
  const currentRunner = runners.find(r => r.id === currentUserId);
  
  // Definir a região inicial do mapa
  const initialRegion = currentRunner?.location ? {
    latitude: currentRunner.location.latitude,
    longitude: currentRunner.location.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  } : {
    latitude: -23.550520,  // Coordenadas padrão (São Paulo)
    longitude: -46.633308,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={tw`flex-1`}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={tw`flex-1`}
        initialRegion={initialRegion}
        region={currentRunner?.location ? {
          latitude: currentRunner.location.latitude,
          longitude: currentRunner.location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        } : undefined}
      >
        {/* Traçado da rota */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#FF6F20"
            strokeWidth={3}
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
              title={runner.name}
              description={`Velocidade: ${runner.speed} km/h`}
              pinColor={runner.id === currentUserId ? '#FF6F20' : '#1E90FF'}
            />
          );
        })}
      </MapView>
    </View>
  );
};

export default MapComponent;