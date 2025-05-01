import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

interface SpeedDisplayProps {
  readonly speedUser1: number;
  readonly speedUser2: number;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speedUser1, speedUser2 }) => {
  return (
    <View style={tw`items-center`}>
      <Text style={tw`text-orange-500 text-3xl font-bold`}>
        Usuário 1: {speedUser1} KM/H
      </Text>
      <Text style={tw`text-orange-500 text-3xl font-bold`}>
        Usuário 2: {speedUser2} KM/H
      </Text>
    </View>
  );
};

export default SpeedDisplay;
