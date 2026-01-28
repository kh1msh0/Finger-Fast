import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// Production Ad Unit IDs for iOS
const IOS_IDS = {
  BANNER: "ca-app-pub-8296385442547902/6353886207",
  INTERSTITIAL: "ca-app-pub-8296385442547902/6992196364",
  REWARDED: "ca-app-pub-8296385442547902/7791455878",
};

// Production Ad Unit IDs for Android
const ANDROID_IDS = {
  BANNER: "ca-app-pub-8296385442547902/1019955972",
  INTERSTITIAL: "ca-app-pub-8296385442547902/7726465554",
  REWARDED: "ca-app-pub-8296385442547902/9740754372",
};

// Select the correct set based on the platform
const productionIds = Platform.select({
  ios: IOS_IDS,
  android: ANDROID_IDS,
  default: ANDROID_IDS, // Fallback
});

export const AdMobIds = {
  BANNER: __DEV__ ? TestIds.BANNER : productionIds.BANNER,
  INTERSTITIAL: __DEV__ ? TestIds.INTERSTITIAL : productionIds.INTERSTITIAL,
  REWARDED: __DEV__ ? TestIds.REWARDED : productionIds.REWARDED,
};
