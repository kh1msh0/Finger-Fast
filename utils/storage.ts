import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'tap_speed_high_score';
const GAME_MODE_KEY = 'tap_speed_game_mode';

export type GameMode = 5 | 10 | 15;

export const saveHighScore = async (score: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

export const getHighScore = async (): Promise<number> => {
  try {
    const score = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    return score ? parseFloat(score) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

export const saveGameMode = async (mode: GameMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(GAME_MODE_KEY, mode.toString());
  } catch (error) {
    console.error('Error saving game mode:', error);
  }
};

export const getGameMode = async (): Promise<GameMode> => {
  try {
    const mode = await AsyncStorage.getItem(GAME_MODE_KEY);
    const parsedMode = mode ? parseInt(mode) : 10;
    return [5, 10, 15].includes(parsedMode) ? parsedMode as GameMode : 10;
  } catch (error) {
    console.error('Error getting game mode:', error);
    return 10;
  }
};