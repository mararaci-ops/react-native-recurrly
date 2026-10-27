import { fontFamilies } from "@/constants/fonts";
import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Añadir la clave Publishable de Clerk al archivo .env");
}

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    [fontFamilies.regular]: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    [fontFamilies.light]: require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
    [fontFamilies.medium]: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    [fontFamilies.semibold]: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    [fontFamilies.bold]: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    [fontFamilies.extrabold]: require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoaded]);

  useEffect(() => {
    if (fontError) {
      Alert.alert("Error al cargar fuentes");
    }
  }, [fontError]);

  if (!fontsLoaded || !authLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootLayoutContent />
    </ClerkProvider>
  );
}
