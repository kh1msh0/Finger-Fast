// AD CONFIGURATION - Replace test ID with your production AdMob Interstitial Ad Unit ID
// Get your Interstitial Ad Unit ID from: https://admob.google.com → Apps → Your App → Ad Units → Interstitial
// Test ID: TestIds.INTERSTITIAL (for development)
// Production ID: ca-app-pub-XXXXXXXXXX/XXXXXXXXXX (for release)
import { AdMobIds } from "@/constants/AdIds";
import { GameMode } from "@/utils/storage";
import { router, useLocalSearchParams } from "expo-router";
import { Clock, Zap } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_adUnitId = AdMobIds.INTERSTITIAL;

const REWARDED_adUnitId = AdMobIds.REWARDED;

export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const GAME_DURATION = parseInt(mode || "10") as GameMode;

  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [tapCount, setTapCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // Revive State
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<number | null>(null);

  // Ad-related refs and state
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const rewardedAdRef = useRef<RewardedAd | null>(null);

  const adLoadedRef = useRef(false);
  const rewardedAdLoadedRef = useRef(false);
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

    const {
      tapCount: finalTapCount,
      speed: finalSpeed,
      duration: finalDuration,
    } = gameResultsRef.current;

    console.log(
      `Navigating to results with: ${finalTapCount} taps, ${finalSpeed.toFixed(2)} TPS, ${finalDuration}s`,
    );

    router.replace({
      pathname: "/results",
      params: {
        tapCount: finalTapCount.toString(),
        speed: finalSpeed.toFixed(2),
        duration: finalDuration.toString(),
      },
    });
  }, []);

  const loadAds = useCallback(async () => {
    console.log("loadAds called");
    try {
      // Attempt to get consent, but don't block ads if it fails (e.g. no form configured yet)
      try {
        const info = await AdsConsent.requestInfoUpdate();
        if (info.canRequestAds) {
          // If we can request ads, great. If not (and we needed to show a form), we might still try loading.
          // For now, we'll proceed unless strictly blocked, but in production proper handling is needed.
        }
      } catch (consentError) {
        console.log(
          "Consent check failed (ignoring for dev/testing):",
          consentError,
        );
        // Continue to load ads anyway
      }

      // --- Interstitial ---
      const interstitial = InterstitialAd.createForAdRequest(
        INTERSTITIAL_adUnitId,
      );
      interstitialRef.current = interstitial;

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log("Interstitial ad loaded");
        adLoadedRef.current = true;
      });
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        console.log("Interstitial ad closed");
        adShownRef.current = true;
        navigateToResults();
      });
      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log("Interstitial ad failed:", error);
        adLoadedRef.current = false;
      });
      interstitial.load();

      // --- Rewarded ---
      const rewarded = RewardedAd.createForAdRequest(REWARDED_adUnitId);
      rewardedAdRef.current = rewarded;

      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log("Rewarded ad loaded");
        rewardedAdLoadedRef.current = true;
      });
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        console.log("Reward earned");
        // Logic handled in handleRevive via state/flow
      });
      rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log("Rewarded ad failed:", error);
        rewardedAdLoadedRef.current = false;
      });
      rewarded.load();
    } catch (error) {
      console.log("Error setting up ads:", error);
    }
  }, [navigateToResults]);

  const showInterstitialAd = useCallback(async () => {
    if (interstitialRef.current && adLoadedRef.current && !adShownRef.current) {
      try {
        await interstitialRef.current.show({
          immersiveModeEnabled: true,
        });
        adShownRef.current = true;
      } catch (error) {
        console.log("Error showing interstitial ad:", error);
        navigateToResults();
      }
    } else {
      navigateToResults();
    }

    setTimeout(() => {
      if (!adShownRef.current) {
        navigateToResults();
      }
    }, 5000);
  }, [navigateToResults]);

  const startCountdown = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;

        // Stop at 0, don't go negative
        if (newTime <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }

        Animated.timing(progressAnim, {
          toValue: newTime / GAME_DURATION,
          duration: 100,
          useNativeDriver: false,
        }).start();
        return newTime;
      });
    }, 100);
  }, [GAME_DURATION, progressAnim]);

  const startGame = useCallback(() => {
    console.log("startGame called");
    setGameStarted(true);
    setGameEnded(false);
    setShowReviveModal(false);
    setHasRevived(false);
    setTimeLeft(GAME_DURATION);
    setTapCount(0);

    progressAnim.setValue(1);

    adLoadedRef.current = false;
    rewardedAdLoadedRef.current = false;
    adShownRef.current = false;
    adLoadingStartedRef.current = false;

    if (!adLoadingStartedRef.current) {
      adLoadingStartedRef.current = true;
      loadAds();
    }

    startCountdown();
  }, [GAME_DURATION, progressAnim, loadAds, startCountdown]);

  const endGame = useCallback(() => {
    setGameEnded(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const finalSpeed = tapCount / GAME_DURATION;
    gameResultsRef.current = {
      tapCount: tapCount,
      speed: finalSpeed,
      duration: GAME_DURATION,
    };

    console.log(`Game ended! Final results: ${tapCount} taps`);

    showInterstitialAd();

    setTimeout(() => {
      if (!adShownRef.current) {
        navigateToResults();
      }
    }, 10000);
  }, [tapCount, GAME_DURATION, showInterstitialAd, navigateToResults]);

  // Game Loop / Timer Check
  useEffect(() => {
    if (timeLeft === 0 && gameStarted && !gameEnded) {
      // Time is up!
      if (!hasRevived) {
        setShowReviveModal(true);
      } else {
        endGame();
      }
    }
  }, [timeLeft, gameStarted, gameEnded, hasRevived, endGame]);

  // Initial Mount
  useEffect(() => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      startGame();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      interstitialRef.current = null;
      rewardedAdRef.current = null;
    };
  }, [startGame]);

  const handleRevive = () => {
    const rewarded = rewardedAdRef.current;
    if (rewarded && rewardedAdLoadedRef.current) {
      let earned = false;

      const onEarnedReward = () => {
        earned = true;
      };

      const onAdClosed = () => {
        if (earned) {
          console.log("Reward confirmed. Extending game.");
          setShowReviveModal(false);
          setHasRevived(true);
          setTimeLeft(5);
          startCountdown();
        } else {
          console.log("Ad closed without reward. Ending game.");
          endGame();
        }
      };

      // One-time listeners
      const unsubEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          onEarnedReward();
          unsubEarned();
        },
      );

      const unsubClosed = rewarded.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          // Small delay to ensure earned event fires first
          setTimeout(onAdClosed, 100);
          unsubClosed();
        },
      );

      rewarded.show();
    } else {
      console.log("Rewarded ad not ready, skipping revive");
      endGame();
    }
  };

  const handleGiveUp = () => {
    setShowReviveModal(false);
    endGame();
  };

  const handleTap = () => {
    if (!gameStarted || gameEnded || showReviveModal) return;

    setTapCount((prev) => prev + 1);

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
      {__DEV__ && (
        <View
          style={{
            position: "absolute",
            top: 100,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontSize: 10 }}>
            Taps: {tapCount}
            {"\n"}
            Time: {Math.ceil(timeLeft)}s{"\n"}
            Revived: {hasRevived ? "Yes" : "No"}
          </Text>
        </View>
      )}

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

      <Text style={styles.instructions}>Tap as fast as you can!</Text>

      <View style={styles.tapAreaContainer}>
        <Pressable onPress={handleTap} style={styles.tapArea}>
          <Animated.View
            style={[styles.tapCircle, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.tapText}>TAP!</Text>
          </Animated.View>
        </Pressable>
      </View>

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

      {/* Revive Modal */}
      {showReviveModal && (
        <View style={[StyleSheet.absoluteFill, styles.modalContainer]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Time&apos;s Up!</Text>
            <Text style={styles.modalSubtitle}>Want 5 extra seconds?</Text>

            <Pressable style={styles.reviveButton} onPress={handleRevive}>
              <View style={styles.buttonRow}>
                <Zap size={24} color="white" fill="white" />
                <Text style={styles.reviveButtonText}>Watch Ad (+5s)</Text>
              </View>
            </Pressable>

            <Pressable style={styles.giveUpButton} onPress={handleGiveUp}>
              <Text style={styles.giveUpButtonText}>
                No thanks, show results
              </Text>
            </Pressable>
          </View>
        </View>
      )}
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
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  reviveButton: {
    backgroundColor: "#4F75FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  giveUpButton: {
    padding: 15,
  },
  giveUpButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
});
