import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import tw from 'twrnc';

interface Runner {
  id: number;
  name: string;
  time: string;
}

interface RankingListProps {
  runners: Runner[];
}

const RankingList: React.FC<RankingListProps> = ({ runners }) => {
  return (
    <View style={tw`bg-gray-800 p-4 rounded-lg mb-4`}>
      <Text style={tw`text-orange-500 text-lg mb-2`}>CLASSIFICAÇÃO</Text>
      <ScrollView style={tw`h-48`}>
        {runners.map((runner, index) => (
          <View
            key={runner.id}
            style={tw`flex-row justify-between items-center py-2 border-b border-gray-700`}
          >
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-white text-lg mr-2`}>{index + 1}º</Text>
              <Text style={tw`text-white text-lg`}>{runner.name}</Text>
            </View>
            <Text style={tw`text-white text-lg`}>
              {runner.time || '--:--'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RankingList;