/** The possible goals of the game. */
export type Goal =
  | { type: 'score'; value: number }
  | { type: 'collect'; items: { [elementType: string]: number } };

/** The possible limits for a game (moves or time). */
export type Limit =
  | { type: 'moves'; value: number }
  | { type: 'time'; seconds: number };

/** The configuration object for initializing a game. */
export interface GameConfig {
  width: number;
  height: number;
  elementTypes: string[];
  goal: Goal;
  limit: Limit;
}

/** The different types of power-ups. */
export type PowerUp = 'Line' | 'Bomb' | 'Joker';

/** Represents a single element on the grid. */
export interface GameElement {
  id: string; // Unique ID for stable animations & keys
  type: string; // e.g., '💎'
  powerUp?: PowerUp;
}

/** Represents the complete state of the game at any given time. */
export interface GameState {
  grid: (GameElement | null)[][];
  status: 'Ready' | 'Running' | 'Finished';
  score: number;
  movesLeft?: number;
  timeLeft?: number;
  result?: 'won' | 'lost';
  goalProgress: any;
}