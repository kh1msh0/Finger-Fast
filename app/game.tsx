import { GameMode } from '@/utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';


export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const GAME_DURATION = parseInt(mode || '10') as GameMode;
  
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [tapCount, setTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Auto-start game after component mounts
    startGame();
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameEnded]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(GAME_DURATION);
    setTapCount(0);
    
    // Reset progress bar animation
    progressAnim.setValue(1);
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        // Update progress bar
        Animated.timing(progressAnim, {
          toValue: newTime / GAME_DURATION,
          duration: 100,
          useNativeDriver: false,
        }).start();
        return Math.max(0, newTime);
      });
    }, 100);
  };

  const endGame = () => {
    setGameEnded(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Navigate to results with game data
    const speed = tapCount / GAME_DURATION;
    router.replace({
      pathname: '/results',
      params: { 
        tapCount: tapCount.toString(),
        speed: speed.toFixed(2),
        duration: GAME_DURATION.toString(),
      },
    });
  };

  const handleTap = () => {
    if (!gameStarted || gameEnded) return;
    
    setTapCount(prev => prev + 1);
    
    // Animate tap feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Header with Timer and Tap Count */}
      <View style={styles.header}>
        <View style={styles.statContainer}>
          <Clock size={20} color="#4F75FF" />
          <Text style={styles.statText}>{Math.ceil(timeLeft)}s</Text>
        </View>
        <View style={styles.statContainer}>
          <Zap size={20} color="#4F75FF" />
          <Text style={styles.statText}>Taps: {tapCount}</Text>
        </View>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>Tap as fast as you can!</Text>

      {/* Tap Area */}
      <View style={styles.tapAreaContainer}>
        <Pressable onPress={handleTap} style={styles.tapArea}>
          <Animated.View 
            style={[
              styles.tapCircle,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Text style={styles.tapText}>TAP!</Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  instructions: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  tapAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4F75FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F75FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  tapText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E0E4FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F75FF',
    borderRadius: 4,
  },
});