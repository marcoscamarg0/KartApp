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
    <View style={tw`bg-gray p-4 rounded-lg mb-4`}>
      <ScrollView style={tw`h-`}>
        {runners.map((runner, index) => (
          <View
            key={runner.id}
            style={tw`flex-row justify-between items-center py-2 border-b border-gray-700`}
          >
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-white text-lg mr-5`}>{index + 1}º</Text>
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