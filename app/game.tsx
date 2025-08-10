import { GameMode } from "@/utils/storage";
import { router, useLocalSearchParams } from "expo-router";
import { Clock, Zap } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-8296385442547902/6992196364";

export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const GAME_DURATION = parseInt(mode || "10") as GameMode;

  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [tapCount, setTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<number | null>(null);
  
  // Ad-related refs and state
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const adLoadedRef = useRef(false);
  const adShownRef = useRef(false);
  const adLoadingStartedRef = useRef(false);
  const gameStartedRef = useRef(false);
  
  // Store game results in refs to ensure they're available when navigating
  const gameResultsRef = useRef<{
    tapCount: number;
    speed: number;
    duration: number;
  } | null>(null);

  const navigateToResults = useCallback(() => {
    if (!gameResultsRef.current) {
      console.log("No game results available for navigation");
      return;
    }
    
    const { tapCount: finalTapCount, speed: finalSpeed, duration: finalDuration } = gameResultsRef.current;
    
    console.log(`Navigating to results with: ${finalTapCount} taps, ${finalSpeed.toFixed(2)} TPS, ${finalDuration}s`);
    
    router.replace({
      pathname: "/results",
      params: {
        tapCount: finalTapCount.toString(),
        speed: finalSpeed.toFixed(2),
        duration: finalDuration.toString(),
      },
    });
  }, []);

  const loadInterstitialAd = useCallback(async () => {
    console.log("loadInterstitialAd called"); // Debug log
    try {
      const canRequest = await AdsConsent.requestInfoUpdate().then(
        (it) => it.canRequestAds
      );

      if (!canRequest) {
        console.log("Ads consent not granted");
        return;
      }

      // Create and load the interstitial ad
      const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_adUnitId);
      interstitialRef.current = interstitial;
      console.log("Interstitial ad created and loading..."); // Debug log

      // Set up event listeners
      const unsubscribeLoaded = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          console.log("Interstitial ad loaded successfully");
          adLoadedRef.current = true;
          unsubscribeLoaded();
        }
      );

      const unsubscribeFailed = interstitial.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.log("Interstitial ad failed to load:", error);
          adLoadedRef.current = false;
          unsubscribeFailed();
        }
      );

      const unsubscribeClosed = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log("Interstitial ad closed, navigating to results");
          adShownRef.current = true;
          unsubscribeClosed();
          // Navigate to results after ad is closed
          navigateToResults();
        }
      );

      // Start loading the ad
      interstitial.load();
    } catch (error) {
      console.log("Error setting up interstitial ad:", error);
      adLoadedRef.current = false;
    }
  }, [navigateToResults]);

  const showInterstitialAd = useCallback(async () => {
    if (interstitialRef.current && adLoadedRef.current && !adShownRef.current) {
      try {
        console.log("Showing interstitial ad...");
        await interstitialRef.current.show({
          immersiveModeEnabled: true,
        });
        adShownRef.current = true;
        // Navigation will happen in the CLOSED event listener
      } catch (error) {
        console.log("Error showing interstitial ad:", error);
        // If showing fails, navigate directly
        navigateToResults();
      }
    } else {
      console.log("Ad not loaded or already shown, navigating directly");
      // Ad not loaded or already shown, navigate directly
      navigateToResults();
    }
    
    // Fallback: if ad doesn't show within 5 seconds, navigate anyway
    setTimeout(() => {
      if (!adShownRef.current) {
        console.log("Ad timeout, navigating to results");
        navigateToResults();
      }
    }, 5000);
  }, [navigateToResults]);

  const startGame = useCallback(() => {
    console.log("startGame called"); // Debug log
    setGameStarted(true);
    setTimeLeft(GAME_DURATION);
    setTapCount(0);

    // Reset progress bar animation
    progressAnim.setValue(1);

    // Reset ad state for new game
    adLoadedRef.current = false;
    adShownRef.current = false;
    adLoadingStartedRef.current = false;
    
    // Start loading the interstitial ad only once per game
    if (!interstitialRef.current && !adLoadingStartedRef.current) {
      console.log("Loading interstitial ad (first time)"); // Debug log
      adLoadingStartedRef.current = true;
      loadInterstitialAd();
    } else {
      console.log("Interstitial ad already exists or loading started, skipping load"); // Debug log
    }

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
  }, [GAME_DURATION, progressAnim]); // Removed loadInterstitialAd dependency

  const endGame = useCallback(() => {
    setGameEnded(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Calculate and store final game results
    const finalSpeed = tapCount / GAME_DURATION;
    gameResultsRef.current = {
      tapCount: tapCount,
      speed: finalSpeed,
      duration: GAME_DURATION
    };
    
    console.log(`Game ended! Final results: ${tapCount} taps, ${finalSpeed.toFixed(2)} TPS, ${GAME_DURATION}s`);

    // Try to show the interstitial ad, with fallback to direct navigation
    showInterstitialAd();
    
    // Safety fallback: if nothing happens within 10 seconds, navigate anyway
    setTimeout(() => {
      if (!adShownRef.current) {
        console.log("Safety fallback: navigating to results after 10 seconds");
        navigateToResults();
      }
    }, 10000);
  }, [tapCount, GAME_DURATION, showInterstitialAd]);

  useEffect(() => {
    // Auto-start game after component mounts, but only once
    if (!gameStartedRef.current) {
      console.log("Component mounted, starting game"); // Debug log
      gameStartedRef.current = true;
      startGame();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Clean up ad event listeners
      if (interstitialRef.current) {
        // Remove all event listeners by setting ref to null
        interstitialRef.current = null;
      }
    };
  }, [startGame]);

  useEffect(() => {
    if (timeLeft === 0 && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameEnded, endGame]);

  // Debug effect to monitor tap count changes
  useEffect(() => {
    console.log(`Tap count updated: ${tapCount}`);
  }, [tapCount]);

  // Debug effect to monitor game results
  useEffect(() => {
    if (gameResultsRef.current) {
      console.log("Game results stored:", gameResultsRef.current);
    }
  }, [gameResultsRef.current]);

  const handleTap = () => {
    if (!gameStarted || gameEnded) return;

    setTapCount((prev) => {
      const newCount = prev + 1;
      console.log(`Tap! Count: ${newCount}`); // Debug log
      return newCount;
    });

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
      {/* Debug info */}
      {__DEV__ && (
        <View style={{ position: 'absolute', top: 100, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 5, borderRadius: 5 }}>
          <Text style={{ color: 'white', fontSize: 10 }}>
            Game: {gameStarted ? 'Yes' : 'No'}{'\n'}
            Ended: {gameEnded ? 'Yes' : 'No'}{'\n'}
            Taps: {tapCount}{'\n'}
            Time: {Math.ceil(timeLeft)}s
            {gameResultsRef.current && (
              <>
                {'\n'}
                Results: {gameResultsRef.current.tapCount} taps, {gameResultsRef.current.speed.toFixed(2)} TPS, {gameResultsRef.current.duration}s
              </>
            )}
          </Text>
        </View>
      )}
      
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
            style={[styles.tapCircle, { transform: [{ scale: scaleAnim }] }]}
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
                  outputRange: ["0%", "100%"],
                }),
              },
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
    backgroundColor: "#F8F9FF",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  instructions: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  tapAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tapArea: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  tapCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#4F75FF",
    shadowColor: "#4F75FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tapText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#E0E4FF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4F75FF",
    borderRadius: 4,
  },
});
