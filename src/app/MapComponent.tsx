import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const MapComponent = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google" // Usa Google Maps como provedor
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="Localização"
          description="Descrição do local"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapComponent;
