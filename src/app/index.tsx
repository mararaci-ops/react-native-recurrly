import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-accent">
      <Text className="text-xl font-bold text-destructive">
        Edit src/app/index.tsx to edit this screen.
      </Text>
      <Link
        className="mt-4 bg-primary text-white rounded-3xl px-4 py-1"
        href={"/(auth)/sign-in"}
      >
        Iniciar sesión
      </Link>
      <Link
        className="mt-4 bg-primary text-white rounded-3xl px-4 py-1"
        href={"/(auth)/sign-up"}
      >
        Nuevo usuario
      </Link>
      <Link href={"/subscriptions/Spotify"}>Suscripcion Spotify</Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
      >
        Suscripcion Claude
      </Link>
    </View>
  );
}
