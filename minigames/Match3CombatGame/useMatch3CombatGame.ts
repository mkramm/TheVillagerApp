import { useState, useCallback } from "react";
import { GameConfig, GameState, GameElement, PowerUp } from "./types";

/**
 * Ein benutzerdefinierter React-Hook, der die gesamte Logik für das Match-3-Spiel kapselt.
 * @param config Das Konfigurationsobjekt für das Spiel.
 * @returns Den aktuellen Spielzustand und Funktionen zur Steuerung des Spiels.
 */
export const useMatch3CombatGame = (config: GameConfig) => {
  const findMatches = (grid: (GameElement | null)[][]): GameElement[][] => {
    const matches: GameElement[][] = [];
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 2; x++) {
        const el1 = grid[y][x];
        const el2 = grid[y][x + 1];
        const el3 = grid[y][x + 2];
        if (
          el1 &&
          el2 &&
          el3 &&
          el1.type === el2.type &&
          el1.type === el3.type
        ) {
          const match = [el1, el2, el3];
          let i = x + 3;
          while (i < width && grid[y][i]?.type === el1.type) {
            match.push(grid[y][i]!);
            i++;
          }
          matches.push(match);
          x = i - 1;
        }
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height - 2; y++) {
        const el1 = grid[y][x];
        const el2 = grid[y + 1][x];
        const el3 = grid[y + 2][x];
        if (
          el1 &&
          el2 &&
          el3 &&
          el1.type === el2.type &&
          el1.type === el3.type
        ) {
          const match = [el1, el2, el3];
          let i = y + 3;
          while (i < height && grid[i][x]?.type === el1.type) {
            match.push(grid[i][x]!);
            i++;
          }
          matches.push(match);
          y = i - 1;
        }
      }
    }
    return matches;
  };

  const findElementPosition = (
    grid: (GameElement | null)[][],
    id: string
  ): { x: number; y: number } | null => {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x]?.id === id) {
          return { x, y };
        }
      }
    }
    return null;
  };

  const handleMatches = (
    grid: (GameElement | null)[][],
    matches: GameElement[][],
    currentScore: number,
    currentGoalProgress?: any
  ): {
    grid: (GameElement | null)[][];
    newScore: number;
    newGoalProgress: any;
    powerUpToCreate?: {
      pos: { x: number; y: number };
      powerUp: PowerUp;
      type: string;
    };
  } => {
    let newGrid = grid.map((row) => [...row]);
    let newScore = currentScore;
    let newGoalProgress = currentGoalProgress
      ? { ...currentGoalProgress }
      : null;
    let powerUpToCreate:
      | { pos: { x: number; y: number }; powerUp: PowerUp; type: string }
      | undefined;

    matches.forEach((match) => {
      newScore += match.length * 10;
      if (config.goal.type === "collect" && newGoalProgress) {
        match.forEach((el) => {
          if (newGoalProgress[el.type] > 0) {
            newGoalProgress[el.type]--;
          }
        });
      }

      const matchLength = match.length;
      if (matchLength >= 4) {
        const firstEl = match[0];
        const pos = findElementPosition(grid, firstEl.id);
        if (pos) {
          if (matchLength === 5) {
            powerUpToCreate = { pos, powerUp: "Joker", type: firstEl.type };
          } else if (matchLength === 4) {
            const secondEl = match[1];
            const secondPos = findElementPosition(grid, secondEl.id);
            const isHorizontal = pos.y === secondPos?.y;
            powerUpToCreate = { pos, powerUp: "Line", type: firstEl.type };
          }
        }
      }

      match.forEach((element) => {
        for (let y = 0; y < newGrid.length; y++) {
          for (let x = 0; x < newGrid[y].length; x++) {
            if (newGrid[y][x]?.id === element.id) {
              newGrid[y][x] = null;
            }
          }
        }
      });
    });

    return { grid: newGrid, newScore, newGoalProgress, powerUpToCreate };
  };

  const applyGravityAndRefill = (
    grid: (GameElement | null)[][],
    config: GameConfig
  ): { grid: (GameElement | null)[][] } => {
    const newGrid = grid.map((row) => [...row]);
    const height = newGrid.length;
    const width = newGrid[0].length;

    for (let x = 0; x < width; x++) {
      const column: (GameElement | null)[] = [];
      for (let y = height - 1; y >= 0; y--) {
        if (newGrid[y][x]) {
          column.push(newGrid[y][x]);
        }
      }
      for (let y = height - 1; y >= 0; y--) {
        newGrid[y][x] = column.length > 0 ? column.shift()! : null;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (newGrid[y][x] === null) {
          newGrid[y][x] = {
            id: `${x}-${y}-${Math.random()}`,
            type: config.elementTypes[
              Math.floor(Math.random() * config.elementTypes.length)
            ],
          };
        }
      }
    }
    return { grid: newGrid };
  };

  const createInitialState = useCallback((): GameState => {
    let grid: (GameElement | null)[][] = [];
    for (let y = 0; y < config.height; y++) {
      const row: (GameElement | null)[] = [];
      for (let x = 0; x < config.width; x++) {
        row.push({
          id: `${x}-${y}-${Math.random()}`,
          type: config.elementTypes[
            Math.floor(Math.random() * config.elementTypes.length)
          ],
        });
      }
      grid.push(row);
    }

    let initialStateGrid = grid;
    let matches = findMatches(initialStateGrid);
    while (matches.length > 0) {
      initialStateGrid = handleMatches(initialStateGrid, matches, 0).grid;
      initialStateGrid = applyGravityAndRefill(initialStateGrid, config).grid;
      matches = findMatches(initialStateGrid);
    }

    return {
      grid: initialStateGrid,
      status: "Ready",
      score: 0,
      movesLeft: config.limit.type === "moves" ? config.limit.value : undefined,
      timeLeft: config.limit.type === "time" ? config.limit.seconds : undefined,
      goalProgress:
        config.goal.type === "collect" ? { ...config.goal.items } : null,
    };
  }, [config]);

  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const checkEndConditions = (state: GameState): GameState => {
    let newStatus = state.status;
    let newResult: "won" | "lost" | undefined = undefined;

    if (config.goal.type === "score" && state.score >= config.goal.value) {
      newStatus = "Finished";
      newResult = "won";
    } else if (config.goal.type === "collect") {
      if (Object.values(state.goalProgress).every((val) => val <= 0)) {
        newStatus = "Finished";
        newResult = "won";
      }
    }

    if (newStatus !== "Finished") {
      if (config.limit.type === "moves" && (state.movesLeft ?? 0) <= 0) {
        newStatus = "Finished";
        newResult = "lost";
      }
      if (config.limit.type === "time" && (state.timeLeft ?? 0) <= 0) {
        newStatus = "Finished";
        newResult = "lost";
      }
    }
    return { ...state, status: newStatus, result: newResult };
  };

  const processTurn = useCallback(
    async (
      gridAfterSwap: (GameElement | null)[][],
      currentGameState: GameState
    ) => {
      let tempGrid = gridAfterSwap;
      let tempScore = currentGameState.score;
      let tempGoalProgress = currentGameState.goalProgress;

      while (true) {
        const matches = findMatches(tempGrid);
        if (matches.length === 0) break;

        const handleResult = handleMatches(
          tempGrid,
          matches,
          tempScore,
          tempGoalProgress
        );
        tempGrid = handleResult.grid;
        tempScore = handleResult.newScore;
        tempGoalProgress = handleResult.newGoalProgress;

        if (handleResult.powerUpToCreate) {
          const { pos, powerUp, type } = handleResult.powerUpToCreate;
          tempGrid[pos.y][pos.x] = {
            id: `${pos.x}-${pos.y}-${Math.random()}`,
            type,
            powerUp,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
        setGameState((prev) => ({
          ...prev,
          grid: tempGrid,
          score: tempScore,
          goalProgress: tempGoalProgress,
        }));

        const gravityResult = applyGravityAndRefill(tempGrid, config);
        tempGrid = gravityResult.grid;

        await new Promise((resolve) => setTimeout(resolve, 300));
        setGameState((prev) => ({ ...prev, grid: tempGrid }));
      }

      return {
        finalGrid: tempGrid,
        finalScore: tempScore,
        finalGoalProgress: tempGoalProgress,
      };
    },
    [config]
  );

  const swapElements = useCallback(
    async (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
      if (gameState.status !== "Running") return;

      let newGrid = gameState.grid.map((row) => [...row]);
      [newGrid[pos1.y][pos1.x], newGrid[pos2.y][pos2.x]] = [
        newGrid[pos2.y][pos2.x],
        newGrid[pos1.y][pos1.x],
      ];

      const matches = findMatches(newGrid);
      if (matches.length === 0) {
        setGameState((prev) => ({ ...prev, grid: newGrid }));
        await new Promise((resolve) => setTimeout(resolve, 200));
        setGameState((prev) => ({ ...prev, grid: gameState.grid }));
        return;
      }

      let tempMovesLeft = gameState.movesLeft;
      if (config.limit.type === "moves") {
        tempMovesLeft = (gameState.movesLeft ?? 1) - 1;
      }

      setGameState((prev) => ({
        ...prev,
        grid: newGrid,
        movesLeft: tempMovesLeft,
      }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { finalGrid, finalScore, finalGoalProgress } = await processTurn(
        newGrid,
        { ...gameState, movesLeft: tempMovesLeft }
      );

      setGameState((currentState) => {
        const stateAfterTurn = {
          ...currentState,
          grid: finalGrid,
          score: finalScore,
          goalProgress: finalGoalProgress,
          movesLeft: tempMovesLeft,
        };
        return checkEndConditions(stateAfterTurn);
      });
    },
    [gameState, config, processTurn]
  );

  const startGame = () =>
    setGameState((prev) => ({ ...prev, status: "Running" }));
  const resetGame = () => setGameState(createInitialState());

  return { gameState, startGame, swapElements, resetGame };
};
