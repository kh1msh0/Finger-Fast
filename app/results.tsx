import { useHighScore } from "@/hooks/useHighScore";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { RotateCcw, Trophy, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

const { height } = Dimensions.get("window");

export default function ResultsScreen() {
  const { tapCount, speed, duration } = useLocalSearchParams<{
    tapCount: string;
    speed: string;
    duration: string;
  }>();

  const { highScore, updateHighScore } = useHighScore();
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const currentSpeed = parseFloat(speed || "0");
  const currentTapCount = parseInt(tapCount || "0");
  const gameDuration = parseInt(duration || "10");

  useEffect(() => {
    checkHighScore();
  }, [currentSpeed]);

  const checkHighScore = async () => {
    const isNew = await updateHighScore(currentSpeed);
    setIsNewHighScore(isNew);
  };

  const getMotivationalMessage = () => {
    if (isNewHighScore) {
      return "New record! Amazing! 🎉";
    }
    if (currentSpeed >= 8) {
      return "Lightning fingers! ⚡";
    }
    if (currentSpeed >= 6) {
      return "You're a tapping pro! 👏";
    }
    if (currentSpeed >= 4) {
      return "Great job! Keep it up! 💪";
    }
    if (currentSpeed >= 2) {
      return "Not bad! Keep practicing! 👍";
    }
    return "Keep practicing! 💪";
  };

  const playAgain = () => {
    router.push(`/game?mode=${gameDuration}`);
  };

  const goHome = () => {
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#4F75FF", "#5B8CFF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Results Section */}
        <View style={styles.resultsSection}>
          <Text style={styles.title}>Your Speed ({gameDuration}s):</Text>

          <View style={styles.speedContainer}>
            <Zap size={24} color="#FFE020" />
            <Text style={styles.speedNumber}>{currentSpeed}</Text>
            <Text style={styles.speedUnit}>taps/second</Text>
          </View>

          <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
        </View>

        {/* High Score Display */}
        <View style={styles.highScoreContainer}>
          <View style={styles.highScoreRow}>
            <View style={styles.highScoreLabel}>
              <Trophy size={20} color="#FFE020" />
              <Text style={styles.highScoreText}>Best Score</Text>
            </View>
            <Text style={styles.highScoreValue}>{highScore.toFixed(1)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.playAgainButton} onPress={playAgain}>
            {({ pressed }) => (
              <View
                style={[styles.buttonContent, pressed && styles.buttonPressed]}
              >
                <RotateCcw size={20} color="#4F75FF" />
                <Text style={styles.buttonText}>Play Again</Text>
              </View>
            )}
          </Pressable>

          <Pressable style={styles.homeButton} onPress={goHome}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.homeButtonText,
                  pressed && styles.homeButtonPressed,
                ]}
              >
                Home
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.1,
    paddingHorizontal: 40,
  },
  resultsSection: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  speedContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 30,
    minWidth: 200,
  },
  speedNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginVertical: 8,
  },
  speedUnit: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  motivationText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  highScoreContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 300,
  },
  highScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  highScoreLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highScoreText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  highScoreValue: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  playAgainButton: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F75FF",
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  homeButtonText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  homeButtonPressed: {
    opacity: 0.6,
  },
});
