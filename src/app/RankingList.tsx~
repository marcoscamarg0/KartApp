import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';

interface Runner {
  id: number;
  name: string;
  time?: string;
  position?: number;
}

interface RankingListProps {
  runners: Runner[];
}

const RankingList = ({ runners = [] }: RankingListProps) => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-orange-500 text-lg mb-2`}>RANKING</Text>
      <View style={tw`space-y-4`}>
        {runners.map((runner, index) => (
          <View 
            key={runner.id} 
            style={tw`flex-row justify-between items-center bg-gray-800 p-2 rounded-lg`}
          >
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-white text-lg font-bold`}>{index + 1}º</Text>
              <Text style={tw`ml-4 text-white text-lg`}>{runner.name}</Text>
              {runner.time && (
                <Text style={tw`ml-4 text-gray-400 text-lg`}>{runner.time}</Text>
              )}
            </View>
            <FontAwesome name="user" size={16} color="white" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default RankingList;