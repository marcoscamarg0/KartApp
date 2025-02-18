import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  location: Location.LocationObject | null;
  route: RouteCoordinate[];
}

const MapComponent: React.FC<MapComponentProps> = ({ location, route }) => {
  const initialRegion = {
    latitude: location?.coords.latitude ?? -15.7801,
    longitude: location?.coords.longitude ?? -47.9292,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Posição Atual"
          >
            <View style={styles.annotationContainer}>
              <View style={styles.annotationFill} />
            </View>
          </Marker>
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
    height: 300,
  },
  map: {
    flex: 1,
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  annotationFill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4500',
    transform: [{ scale: 0.8 }],
  },
});

export default MapComponent;