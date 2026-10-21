import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="tex-xl font-bold text-success">
        Bienvenido a Suscripciones
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
      <Link
        href={{
          pathname: "/subscriptions",
          params: { id: "claude" },
        }}
      >
        Suscripciones
      </Link>
    </SafeAreaView>
  );
}
