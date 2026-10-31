import { SafeAreaViewStyled } from "@/constants/pages";
import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaViewStyled className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-start px-6 pt-8 pb-41"
          scrollsChildToFocus={Platform.OS === "android"}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md">
            <View className="mb-6 flex-row max-w-md justify-center">
              <View className="mr-4">
                <Image
                  source={require("../../../assets/icons/logo.png")}
                  className="h-16 w-16"
                  resizeMode="contain"
                  accessibilityLabel="Recurly"
                />
              </View>
              <View className="items-start">
                <Text className="mt-3 font-sans-bold text-lg tracking-wide text-primary">
                  RECURLY
                </Text>
                <Text className="mt-0.5 font-sans text-xs tracking-widest text-muted-foreground">
                  SMART BILLING
                </Text>
              </View>
            </View>

            <View className="mb-4 items-center">
              <Text className="text-center font-sans-bold text-3xl text-primary">
                {title}
              </Text>
              <Text className="mt-2 text-center font-sans text-base leading-6 text-muted-foreground">
                {subtitle}
              </Text>
            </View>

            {children}
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewStyled>
  );
}
