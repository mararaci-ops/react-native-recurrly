import { fontFamilies } from "@/constants/fonts";
import "@/global.css";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { posthog, resetPostHogIdentity } from "@/lib/posthog";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Añadir la clave Publishable de Clerk al archivo .env");
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog || !isLoaded) return;

    if (!user) {
      if (identifiedUserId.current) {
        resetPostHogIdentity();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) return;

    if (identifiedUserId.current) {
      resetPostHogIdentity();
    }

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName ?? user.firstName;

    posthog.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
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

  useEffect(() => {
    if (posthog && fontsLoaded && authLoaded) {
      posthog.screen(pathname);
    }
  }, [authLoaded, fontsLoaded, pathname]);

  if (!fontsLoaded || !authLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const content = <RootLayoutContent />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogIdentity />
      {posthog ? (
        <PostHogProvider
          client={posthog}
          autocapture={{ captureScreens: false, captureTouches: true }}
        >
          {content}
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
