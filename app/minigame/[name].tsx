import { useLocalSearchParams, Stack } from 'expo-router';
import React from 'react'; // Bereits oben importiert
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'; // Bereits oben importiert
import { Match3CombatGame, MergeGame } from '../../minigames'; // Entfernt, da Platzhalter-Komponenten unten definiert sind
import styles from '../styles'; // Importieren Sie die Styles aus der zentralen Datei

export default function MinigameHostScreen() { // Umbenannt, um Konflikte zu vermeiden
  const { name } = useLocalSearchParams<{ name: string }>();

  const renderGameComponent = () => {
    // In einer echten App würden Sie die Komponente dynamisch laden
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
      {/* Setzt den Titel der Seite dynamisch */}
      <Stack.Screen options={{ title: name || 'Minispiel' }} />
      <View style={styles.hostContent}>
        {renderGameComponent()}
        {/* Der Zurück-Button wird vom Stack-Navigator automatisch bereitgestellt */}
      </View>
    </SafeAreaView>
  );
}