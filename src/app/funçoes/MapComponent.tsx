import React from 'react';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  location: Location.LocationObject | null;
  route: RouteCoordinate[];
  isTracking: boolean;
  speed: number;}

const MapComponent: React.FC<MapComponentProps> = ({ location, route, isTracking, speed }) => {
  const initialRegion = {
    latitude: location?.coords.latitude ?? -23.550520,
    longitude: location?.coords.longitude ?? -46.633308,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        region={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        } : undefined}
        mapType="standard"
        rotateEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={`Velocidade: ${speed.toFixed(1)} KM/H`}
          />
        )}
        
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#FF4500"
            strokeWidth={3}
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