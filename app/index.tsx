import { useGameMode } from "@/hooks/useGameMode";
import { useHighScore } from "@/hooks/useHighScore";
import { GameMode } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Play, Trophy } from "lucide-react-native";
import React, { useRef } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";

const ADAPTIVE_BANNER_adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-8296385442547902/6353886207";

const { height } = Dimensions.get("window");

export default function StartScreen() {
  const bannerRef = useRef<BannerAd>(null);

  const { highScore } = useHighScore();
  const { gameMode, updateGameMode } = useGameMode();
  const router = useRouter();

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });

  const play = () => {
    router.replace(`/game?mode=${gameMode}`);
  };

  return (
    <LinearGradient
      colors={["#5B8CFF", "#4F75FF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Fastest Finger</Text>
          {/* <Text style={styles.title}>Tap Speed{"\n"}Challenge</Text> */}
          <Text style={styles.subtitle}>Test your finger speed!</Text>
        </View>

        {/* Decorative Circle */}
        <View style={styles.decorativeCircle}>
          <View style={styles.innerCircle}>
            <View style={styles.centerDot} />
          </View>
        </View>

        {/* Game Mode Selector */}
        <View style={styles.gameModeContainer}>
          <Text style={styles.gameModeTitle}>Game Duration</Text>
          <View style={styles.gameModeButtons}>
            {([5, 10, 15] as GameMode[]).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.gameModeButton,
                  gameMode === mode && styles.gameModeButtonActive,
                ]}
                onPress={() => updateGameMode(mode)}
              >
                <Text
                  style={[
                    styles.gameModeButtonText,
                    gameMode === mode && styles.gameModeButtonTextActive,
                  ]}
                >
                  {mode}s
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* High Score Display */}
        <View style={styles.highScoreContainer}>
          <Trophy size={20} color="#FFE020" />
          <Text style={styles.highScoreText}>
            Best:{" "}
            {highScore > 0 ? `${highScore.toFixed(1)} TPS` : "No record yet"}
          </Text>
        </View>

        {/* Start Button */}

        <Pressable style={styles.startButton} onPress={play}>
          {({ pressed }) => (
            <View
              style={[styles.buttonContent, pressed && styles.buttonPressed]}
            >
              <Play size={20} color="#4F75FF" />
              <Text style={styles.buttonText}>Start Game</Text>
            </View>
          )}
        </Pressable>
      </View>
      <View style={{ minHeight: 63 }}>
        <BannerAd
          ref={bannerRef}
          unitId={ADAPTIVE_BANNER_adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.1,
    paddingHorizontal: 40,
  },
  titleSection: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    lineHeight: 56,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  decorativeCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
  },
  gameModeContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  gameModeTitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    fontWeight: "500",
  },
  gameModeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  gameModeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: "center",
  },
  gameModeButtonActive: {
    backgroundColor: "white",
  },
  gameModeButtonText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  gameModeButtonTextActive: {
    color: "#4F75FF",
  },
  highScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highScoreText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 10,
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
});
