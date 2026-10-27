import { ActivityIndicator, View } from "react-native";

export function AuthLoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#ea7a53" size="large" />
    </View>
  );
}
