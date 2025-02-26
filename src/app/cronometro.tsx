import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';

interface ChronometerProps {
  isActive?: boolean;
  onTimeUpdate?: (time: string) => void;
}

const Chronometer: React.FC<ChronometerProps> = ({
  isActive = true,
  onTimeUpdate
}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startChronometer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - lastTimeRef.current;
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now() - (startTimeRef.current ?? 0);
        setTime(currentTime);
        lastTimeRef.current = currentTime;
        if (onTimeUpdate) {
          onTimeUpdate(formatTime(currentTime));
        }
      }, 1000);
    }
  };

  const stopChronometer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetChronometer = () => {
    stopChronometer();
    setTime(0);
    lastTimeRef.current = 0;
    startTimeRef.current = null;
    if (onTimeUpdate) {
      onTimeUpdate('0:00');
    }
  };

  const handlePress = () => {
    if (isRunning) {
      Alert.alert(
        'Cronômetro',
        'O que você deseja fazer?',
        [
          {
            text: 'Pausar',
            onPress: stopChronometer,
            style: 'default',
          },
          {
            text: 'Resetar',
            onPress: resetChronometer,
            style: 'destructive',
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } else {
      startChronometer();
    }
  };

  useEffect(() => {
    if (isActive && !isRunning) {
      startChronometer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={tw`bg-gray-800 p-4 rounded-lg`}
    >
      <Text style={tw`text-orange-500 text-lg`}>
        VOLTA ATUAL {isRunning ? '▶' : '⏸'}
      </Text>
      <Text style={tw`text-white text-3xl font-bold`}>
        {formatTime(time)}
      </Text>
    </TouchableOpacity>
  );
};

export default Chronometer;