import { useLocalSearchParams, Stack } from 'expo-router';
import React from 'react';
import { Text, View, SafeAreaView } from 'react-native';
import { Match3CombatGame, MergeGame } from '../../minigames';
import styles from '../styles';

export default function MinigameHostScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();

  const renderGameComponent = () => {
    
    if (name === 'Match-3-Kampf') {
      return <Match3CombatGame />;
    }
    if (name === 'Merge-Spiel') {
        return <MergeGame />;
    }
    return <Text>Unbekanntes Spiel</Text>;
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Stack.Screen options={{ title: name || 'Minispiel' }} />
      <View style={styles.hostContent}>
        {renderGameComponent()}
      </View>
    </SafeAreaView>
  );
}