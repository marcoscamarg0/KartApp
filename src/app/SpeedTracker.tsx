import { useState, useEffect } from 'react'; // Remove o 'React' daqui
import * as Location from 'expo-location';
import SpeedDisplay from './SpeedDisplay';

const SpeedTracker = () => {
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1
        },
        (location) => {
          const speedKmh = location.coords.speed
            ? (location.coords.speed * 3.6).toFixed(1)
            : '0';
          setCurrentSpeed(parseFloat(speedKmh));
        }
      );
    })();
  }, []);

  return <SpeedDisplay speed={currentSpeed} />;
};

export default SpeedTracker;