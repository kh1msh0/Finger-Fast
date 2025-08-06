import { useState, useEffect } from 'react';
import { getGameMode, saveGameMode, GameMode } from '@/utils/storage';

export const useGameMode = () => {
  const [gameMode, setGameMode] = useState<GameMode>(10);

  useEffect(() => {
    loadGameMode();
  }, []);

  const loadGameMode = async () => {
    const mode = await getGameMode();
    setGameMode(mode);
  };

  const updateGameMode = async (newMode: GameMode) => {
    setGameMode(newMode);
    await saveGameMode(newMode);
  };

  return {
    gameMode,
    updateGameMode,
    refreshGameMode: loadGameMode,
  };
};