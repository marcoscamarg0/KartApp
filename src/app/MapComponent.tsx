import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';

MapboxGL.setAccessToken("pk.eyJ1IjoibmlnaHRhcnR6IiwiYSI6ImNtNnFyNmEwYzFpemoyanE4NWVkanM2NHIifQ.l5DkMGkgR3bVq39u9tCVYw");

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  location: Location.LocationObject | null;
  route: RouteCoordinate[];
}

const MapComponent: React.FC<MapComponentProps> = ({ location, route }) => {
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
      }
    })();
  }, []);

  const initialCamera = {
    centerCoordinate: [
      location?.coords.longitude ?? -46.633308,
      location?.coords.latitude ?? -23.550520
    ],
    zoomLevel: 15,
    pitch: 45,
    heading: 0
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        styleURL={"mapbox://styles/mapbox/streets-v11"}
        style={styles.map}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        <MapboxGL.Camera
          defaultSettings={initialCamera}
      centerCoordinate={location ? [
        location.coords.longitude,
        location.coords.latitude
      ] : initialCamera.centerCoordinate}
      followUserLocation={true}
      followZoomLevel={15}
      followPitch={45}
    />

    <MapboxGL.UserLocation
      visible={true}
      showsUserHeadingIndicator={true}
    />

    {route.length > 0 && (
      <MapboxGL.ShapeSource
        id="routeSource"
        shape={{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.map(coord => [coord.longitude, coord.latitude])
          }
        }}
      >
        <MapboxGL.LineLayer
          id="routeLine"
          style={{
            lineColor: '#FF4500',
            lineWidth: 4,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      </MapboxGL.ShapeSource>
    )}
  </MapboxGL.MapView>
</View>
); };

const styles = StyleSheet.create({ container: { flex: 1, borderRadius: 8, overflow: 'hidden', height: 300, }, map: { flex: 1, }, });

export default MapComponent;