import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

interface SpeedDisplayProps {
  speed: number;
}

const SpeedDisplay = ({ speed }: SpeedDisplayProps) => {
  return (
    <View style={tw`items-center`}>
      <Text style={tw`text-orange-500 text-3xl font-bold`}>{speed} KM/H</Text>
    </View>
  );
};

export default SpeedDisplay;