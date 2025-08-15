import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";


import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

import {
  AdsConsent,
  AdsConsentStatus
} from "react-native-google-mobile-ads";
import mobileAds from "react-native-google-mobile-ads/src";

import { initializeApp } from 'firebase/app';

// This alone might be sufficient since Expo handles the config
const app = initializeApp({});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [adsLoaded, setAdsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // TODO: if the ATT doesn't show up, add a small delay
      await requestTrackingPermissionsAsync();
      try {
        const consentInfo = await AdsConsent.requestInfoUpdate();
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdsConsentStatus.REQUIRED
        ) {
          await AdsConsent.showForm();
        }
        await mobileAds().initialize();
        setAdsLoaded(true);
      } catch (e) {
        console.log("error", e);
      }
    };
    void prepare();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // if (!adsLoaded) {
  //   return null;
  // }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="game" options={{ animation: "none" }} />
        <Stack.Screen name="results" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* <StatusBar style="dark" /> */}
    </ThemeProvider>
  );
}
