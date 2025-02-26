import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native'; // Adicione a importação do Text
import * as Location from 'expo-location';
import SpeedDisplay from './SpeedDisplay';

interface SpeedTrackerProps {
  onDistanceUpdate?: (distance: number) => void;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

const SpeedTracker: React.FC<SpeedTrackerProps> = ({ onDistanceUpdate }) => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [lastCoordinate, setLastCoordinate] = useState<Coordinate | null>(null);

  const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371;
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        (location) => {
          const speed = location.coords.speed ?? 0;
          const speedKmh = speed * 3.6;
          const finalSpeed = speedKmh < 1 ? 0 : Number(speedKmh.toFixed(1));
          setCurrentSpeed(finalSpeed);

          const currentCoordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          };

          if (lastCoordinate) {
            const distance = calculateDistance(lastCoordinate, currentCoordinate);
            const newTotalDistance = totalDistance + distance;
            setTotalDistance(newTotalDistance);
            if (onDistanceUpdate) {
              onDistanceUpdate(newTotalDistance);
            }
          }

          setLastCoordinate(currentCoordinate);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [lastCoordinate, totalDistance]);

  return (
    <View>
      <SpeedDisplay speed={currentSpeed} />
      <Text style={{ color: 'white' }}>
        Distância: {totalDistance.toFixed(2)} km
      </Text>
    </View>
  );
};

export default SpeedTracker;