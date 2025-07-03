import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useMatch3CombatGame } from './useMatch3CombatGame';
import { GameConfig, GameElement, PowerUp, Goal, Limit } from './types';

import styles from './styles';

const GameElementDisplay: React.FC<{ element: GameElement | null, size: number }> = ({ element, size }) => {
    const powerUpSymbols: {[key in PowerUp]: string} = { 'Bomb': '💣', 'Line': '↔️', 'Joker': '🌈' };

    if (!element) {
        return <View style={[styles.elementEmpty, {width: size, height: size}]} />;
    }
    
    const displaySymbol = element.powerUp ? powerUpSymbols[element.powerUp] : element.type;

    return (
        <View style={[styles.element, {width: size, height: size}]}>
            <Text style={[styles.elementText, {fontSize: size * 0.6}]}>{displaySymbol}</Text>
        </View>
    );
};

const GameGrid: React.FC<{ grid: (GameElement | null)[][]; onSwap: (pos1: {x: number, y: number}, pos2: {x: number, y: number}) => void; disabled: boolean; elementSize: number }> = ({ grid, onSwap, disabled, elementSize }) => {
    const [selected, setSelected] = useState<{x: number, y: number} | null>(null);

    const handlePress = (x: number, y: number) => {
        if (disabled) return;
        if (!selected) {
            setSelected({ x, y });
        } else {
            const dx = Math.abs(x - selected.x);
            const dy = Math.abs(y - selected.y);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                onSwap(selected, { x, y });
                setSelected(null);
            } else {
                setSelected({ x, y });
            }
        }
    };

    return (
        <View style={styles.gridContainer}>
            {grid.map((row, y) => (
                <View key={y} style={styles.gridRow}>
                    {row.map((element, x) => (
                        <TouchableOpacity
                            key={element?.id || `${x}-${y}`}
                            onPress={() => handlePress(x, y)}
                            style={[styles.elementWrapper, selected && selected.x === x && selected.y === y ? styles.elementSelected : null]}
                        >
                            <GameElementDisplay element={element} size={elementSize} />
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const GoalPanel: React.FC<{ goal: Goal, progress: any, score: number }> = ({ goal, progress, score }) => (
    <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ziel</Text>
        {goal.type === 'score' && (
            <Text style={styles.panelText}>{score} / {goal.value} Pkt.</Text>
        )}
        {goal.type === 'collect' && (
            <View style={styles.collectGoalContainer}>
                {Object.entries(goal.items).map(([type, value]) => (
                    <View key={type} style={styles.collectGoalItem}>
                        <Text style={styles.panelTextLg}>{type}</Text>
                        <Text style={styles.panelTextBold}>{Math.max(0, progress?.[type] ?? 0)}</Text>
                    </View>
                ))}
            </View>
        )}
    </View>
);

const GameInfoPanel: React.FC<{ limit: Limit, movesLeft?: number, timeLeft?: number }> = ({ limit, movesLeft, timeLeft }) => (
    <View style={styles.panel}>
        {limit.type === 'moves' && (
            <>
                <Text style={styles.panelTitle}>Züge</Text>
                <Text style={styles.infoText}>{movesLeft}</Text>
            </>
        )}
        {limit.type === 'time' && (
            <>
                <Text style={styles.panelTitle}>Zeit</Text>
                <Text style={styles.infoText}>{timeLeft}s</Text>
            </>
        )}
    </View>
);

const GameOverModal: React.FC<{ result: 'won' | 'lost', onRestart: () => void }> = ({ result, onRestart }) => {
    const messages = {
        won: { title: "Gewonnen!", body: "Gut gemacht! Du hast das Ziel erreicht." },
        lost: { title: "Verloren!", body: "Leider nicht geschafft. Versuche es erneut!" }
    };
    const message = messages[result];
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [fadeAnim]);

    return (
        <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, transform: [{
                scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
            }] }]}>
                <Text style={[styles.modalTitle, result === 'won' ? styles.modalTitleWon : styles.modalTitleLost]}>{message.title}</Text>
                <Text style={styles.modalBody}>{message.body}</Text>
                <TouchableOpacity onPress={onRestart} style={styles.restartButton}>
                    <Text style={styles.restartButtonText}>Neustart</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

// === HOST SCREEN (React Native App) ===

export default function App() {
    const gameConfig: GameConfig = useMemo(() => ({
      width: 8,
      height: 8,
      elementTypes: ['💎', '🍎', '⭐', '🍀', '💧', '🔥'],
      goal: { type: 'collect', items: { '💎': 20, '🍎': 20 } },
      limit: { type: 'moves', value: 30 },
    }), []);

    // The logic hook is used here to manage the state
    const { gameState, startGame, swapElements, resetGame } = useMatch3CombatGame(gameConfig);

    const handleRestart = () => {
        resetGame();
        setTimeout(() => {
            startGame();
        }, 100);
    }
    
    // A fixed element size is used to avoid the Dimensions API
    const elementSize = 40;

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.topContainer}>
                <GoalPanel goal={gameConfig.goal} progress={gameState.goalProgress} score={gameState.score} />
                <GameInfoPanel limit={gameConfig.limit} movesLeft={gameState.movesLeft} timeLeft={gameState.timeLeft} />
            </View>
            
            <View style={styles.gameArea}>
                <GameGrid 
                    grid={gameState.grid} 
                    onSwap={swapElements}
                    disabled={gameState.status !== 'Running'}
                    elementSize={elementSize}
                />
            </View>

            {gameState.status === 'Ready' && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity onPress={startGame} style={styles.startButton}>
                        <Text style={styles.startButtonText}>Spiel starten</Text>
                    </TouchableOpacity>
                </View>
            )}
            {gameState.status === 'Finished' && gameState.result && (
                <GameOverModal result={gameState.result} onRestart={handleRestart} />
            )}
        </SafeAreaView>
    );
}