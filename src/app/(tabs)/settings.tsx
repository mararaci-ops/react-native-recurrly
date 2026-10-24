import { SafeAreaViewStyled } from "@/constants/pages";
import { Text } from "react-native";

export default function Settings() {
  return (
    <SafeAreaViewStyled className="flex-1 bg-background p-5">
      <Text className="font-sans">Settings</Text>
    </SafeAreaViewStyled>
  );
}
