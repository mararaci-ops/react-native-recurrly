import { SafeAreaViewStyled } from "@/constants/pages";
import { Text } from "react-native";

export default function Insights() {
  return (
    <SafeAreaViewStyled className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-extrabold">Insights</Text>
    </SafeAreaViewStyled>
  );
}
