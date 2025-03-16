import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';

interface Coordinate {
  latitude: number;
  longitude: number;
}

const SpeedTracker = () => {
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastCoordinate, setLastCoordinate] = useState<Coordinate | null>(null);

  const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371;
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      }, (location) => {
        const currentCoordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        if (lastCoordinate) {
          const distance = calculateDistance(lastCoordinate, currentCoordinate);
          const newTotalDistance = totalDistance + distance;
          setTotalDistance(newTotalDistance);
        }

        setLastCoordinate(currentCoordinate);
      });
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [totalDistance, lastCoordinate]);

  return (
    <View>
      <Text>DISTÂNCIA</Text>
      <Text>{totalDistance.toFixed(2)} KM</Text>
    </View>
  );
};

export default SpeedTracker;
