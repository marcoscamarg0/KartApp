import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import SpeedDisplay from './SpeedDisplay';

interface SpeedTrackerProps {}

const SpeedTracker: React.FC<Readonly<SpeedTrackerProps>> = () => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

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
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return <SpeedDisplay speed={currentSpeed} />;
};

export default SpeedTracker;