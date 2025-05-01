import * as Location from 'expo-location';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  locationUser1: Location.LocationObject | null;
  locationUser2: Location.LocationObject | null;
  route: RouteCoordinate[];
  isTracking: boolean;
  speed: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  locationUser1, 
  locationUser2, 
  route, 
  isTracking, 
  speed 
}) => {
  const initialRegion = {
    latitude: locationUser1?.coords.latitude ?? -23.550520,
    longitude: locationUser1?.coords.longitude ?? -46.633308,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  // Calcular rotação do carro baseada na direção
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const toDeg = (value: number): number => (value * 180) / Math.PI;
    
    const startLat = toRad(lat1);
    const startLong = toRad(lon1);
    const destLat = toRad(lat2);
    const destLong = toRad(lon2);
    
    const y = Math.sin(destLong - startLong) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
              Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLong - startLong);
    let bearing = Math.atan2(y, x);
    bearing = toDeg(bearing);
    return (bearing + 360) % 360;
  };

  // Determinar direção do carro se houver histórico de rota
  const getCarRotation = (location: Location.LocationObject | null, isUser1: boolean): number => {
    if (!location || route.length < 2) return 0;
    
    if (isUser1 && route.length >= 2) {
      const lastIndex = route.length - 1;
      const prevLatitude = route[lastIndex - 1].latitude;
      const prevLongitude = route[lastIndex - 1].longitude;
      const currLatitude = location.coords.latitude;
      const currLongitude = location.coords.longitude;
      
      return calculateBearing(prevLatitude, prevLongitude, currLatitude, currLongitude);
    } 
    
    return 0;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        region={locationUser1 ? {
          latitude: locationUser1.coords.latitude,
          longitude: locationUser1.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        } : undefined}
        mapType="standard"
        rotateEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {locationUser1 && (
          <Marker
            coordinate={{
              latitude: locationUser1.coords.latitude,
              longitude: locationUser1.coords.longitude,
            }}
            title={`Usuário 1 - ${speed.toFixed(1)} KM/H`}
            rotation={getCarRotation(locationUser1, true)}
            anchor={{x: 0.5, y: 0.5}}
          >
            <Image 
              source={require('../assets/carrover.png')} 
              style={{width: 32, height: 32}}
              resizeMode="contain"
            />
          </Marker>
        )}

        {locationUser2 && (
          <Marker
            coordinate={{
              latitude: locationUser2.coords.latitude,
              longitude: locationUser2.coords.longitude,
            }}
            title={`Usuário 2 - ${speed.toFixed(1)} KM/H`}
            rotation={getCarRotation(locationUser2, false)}
            anchor={{x: 0.5, y: 0.5}}
          >
            <Image 
              source={require('../assets/carroazul.png')} 
              style={{width: 32, height: 32}}
              resizeMode="contain"
            />
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#FF6F20"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

export default MapComponent;
