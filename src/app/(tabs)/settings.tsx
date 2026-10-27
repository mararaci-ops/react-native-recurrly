import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import images from "@/constants/images";
import { SafeAreaViewStyled } from "@/constants/pages";
import { getAuthErrorMessage } from "@/lib/auth";
import { formatoFecha } from "@/lib/utils";
import { useAuth, useSession, useUser } from "@clerk/expo";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Settings() {
  const { signOut } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [failedProfileImageUrl, setFailedProfileImageUrl] = useState<
    string | null
  >(null);

  if (!userLoaded || !sessionLoaded) {
    return <AuthLoadingScreen />;
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "";
  const displayName = user?.firstName || user?.fullName || email || "User";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      await signOut();
    } catch (error) {
      setSignOutError(
        getAuthErrorMessage(
          error,
          "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaViewStyled className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-32 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-sans-bold text-2xl text-primary">Settings</Text>

        <View className="min-h-24 flex-row items-center gap-4 rounded-3xl border border-border bg-card p-5">
          <Image
            source={
              user?.imageUrl && user.imageUrl !== failedProfileImageUrl
                ? { uri: user.imageUrl }
                : images.avatar
            }
            onError={() => setFailedProfileImageUrl(user?.imageUrl ?? null)}
            className="h-16 w-16 rounded-full"
            resizeMode="cover"
            accessibilityLabel={`${displayName} profile photo`}
          />
          <View className="min-w-0 flex-1 gap-1">
            <Text
              className="font-sans-bold text-base text-primary"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text
              className="font-sans text-sm text-muted-foreground"
              numberOfLines={1}
            >
              {email || "Email No disponible"}
            </Text>
          </View>
        </View>

        <View className="gap-5 rounded-3xl border border-border bg-card p-5">
          <Text className="font-sans-semibold text-base text-primary">
            Cuenta
          </Text>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="font-sans text-sm text-muted-foreground">ID</Text>
            <Text
              className="min-w-0 flex-1 text-right font-sans-semibold text-sm text-primary"
              numberOfLines={1}
              selectable
            >
              {user?.id ?? "No disponible"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="font-sans text-sm text-muted-foreground">
              Inicio de Sesión
            </Text>
            <Text className="font-sans-semibold text-sm text-primary">
              {session?.createdAt
                ? formatoFecha(session.createdAt)
                : "No disponible"}
            </Text>
          </View>
        </View>

        <View>
          <Pressable
            className={`min-h-12 flex-row items-center justify-center rounded-xl bg-accent px-4 ${
              isSigningOut ? "opacity-60" : "active:opacity-70"
            }`}
            onPress={handleSignOut}
            disabled={isSigningOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            accessibilityState={{
              disabled: isSigningOut,
              busy: isSigningOut,
            }}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#081126" />
            ) : (
              <Text className="font-sans-semibold text-primary">Sign Out</Text>
            )}
          </Pressable>
          {signOutError ? (
            <Text
              className="mt-3 text-center font-sans text-sm text-destructive"
              accessibilityRole="alert"
            >
              {signOutError}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaViewStyled>
  );
}
