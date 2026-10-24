import "@/global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { fontFamilies } from "@/constants/fonts";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [fontFamilies.regular]: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    [fontFamilies.light]: require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
    [fontFamilies.medium]: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    [fontFamilies.semibold]: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    [fontFamilies.bold]: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    [fontFamilies.extrabold]: require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && Platform.OS !== "web") {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
