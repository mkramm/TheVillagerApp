import { Link } from 'expo-router';
import React from 'react';
import { Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import styles from './styles';

const minigames = [
    { id: '1', name: 'Match-3-Kampf', component: 'Match3Combat' as const },
    { id: '2', name: 'Merge-Spiel', component: 'MergeGame' as const },
    { id: '3', name: 'Turmverteidigung (Demnächst)', component: null },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>The Villager</Text>
        <Text style={styles.subtitle}>Wähle ein Minispiel</Text>
        <FlatList
          data={minigames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            item.component ? (
              <Link href={`/minigame/${item.name}`} asChild>
                <TouchableOpacity
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>
                    Starte {item.name}
                  </Text>
                </TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.disabledButton]}
                disabled
              >
                <Text style={[styles.buttonText, styles.disabledButtonText]}>
                  Starte {item.name}
                </Text>
              </TouchableOpacity>
            )
          )}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}