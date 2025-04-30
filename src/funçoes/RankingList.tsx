import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Runner } from '../funçoes/RaceDataService';
import tw from 'twrnc';

interface RankingListProps {
  runners: Runner[];
  currentUserId: string;
}

const RankingList: React.FC<RankingListProps> = ({ runners, currentUserId }) => {
  // Ordenar os corredores por volta e distância
  const sortedRunners = [...runners].sort((a, b) => {
    if (a.lap !== b.lap) return b.lap - a.lap;
    return b.distance - a.distance;
  });

  // Renderizar cada item da lista
  const renderItem = ({ item, index }: { item: Runner; index: number }) => {
    const isCurrentUser = item.id === currentUserId;
    
    return (
      <View 
        style={[
          tw`flex-row justify-between items-center py-2 px-1`,
          isCurrentUser ? tw`bg-gray-700 rounded-lg` : null
        ]}
      >
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-white text-lg font-bold w-8`}>{index + 1}</Text>
          <Text style={tw`text-white text-lg ${isCurrentUser ? 'font-bold' : ''}`}>
            {item.name}
          </Text>
        </View>
        
        <View style={tw`flex-row`}>
          <Text style={tw`text-white text-lg mr-4`}>
            Volta {item.lap}
          </Text>
          <Text style={tw`text-white text-lg`}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={sortedRunners}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={tw`py-2`}
    />
  );
};

export default RankingList;