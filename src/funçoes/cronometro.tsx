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
  const [timeUser1, setTimeUser1] = useState(0);
  const [timeUser2, setTimeUser2] = useState(0);
  const [isRunningUser1, setIsRunningUser1] = useState(false);
  const [isRunningUser2, setIsRunningUser2] = useState(false);

  const intervalRefUser1 = useRef<NodeJS.Timeout | null>(null);
  const intervalRefUser2 = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const startChronometerUser1 = () => {
    if (!isRunningUser1) {
      setIsRunningUser1(true);
      intervalRefUser1.current = setInterval(() => {
        setTimeUser1(prevTime => prevTime + 1000);
        if (onTimeUpdate) {
          onTimeUpdate(formatTime(timeUser1));
        }
      }, 1000);
    }
  };

  const startChronometerUser2 = () => {
    if (!isRunningUser2) {
      setIsRunningUser2(true);
      intervalRefUser2.current = setInterval(() => {
        setTimeUser2(prevTime => prevTime + 1000);
        if (onTimeUpdate) {
          onTimeUpdate(formatTime(timeUser2));
        }
      }, 1000);
    }
  };

  const stopChronometer = () => {
    if (intervalRefUser1.current) {
      clearInterval(intervalRefUser1.current);
    }
    if (intervalRefUser2.current) {
      clearInterval(intervalRefUser2.current);
    }
    setIsRunningUser1(false);
    setIsRunningUser2(false);
  };

  const handlePress = () => {
    if (isRunningUser1 || isRunningUser2) {
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
            onPress: stopChronometer,
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
      startChronometerUser1();
      startChronometerUser2();
    }
  };

  useEffect(() => {
    if (isActive) {
      startChronometerUser1();
      startChronometerUser2();
    }

    return () => {
      if (intervalRefUser1.current) {
        clearInterval(intervalRefUser1.current);
      }
      if (intervalRefUser2.current) {
        clearInterval(intervalRefUser2.current);
      }
    };
  }, [isActive]);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={tw` p-2 rounded-lg`}
    >
      <Text style={tw`text-orange-500 text-sm`}>
        VOLTA ATUAL {isRunningUser1 || isRunningUser2 ? '▶' : '⏸'}
      </Text>
      <Text style={tw`text-white text-xl font-bold`}>
        {formatTime(timeUser1)} 
      </Text>
    </TouchableOpacity>
  );
};

export default Chronometer;
