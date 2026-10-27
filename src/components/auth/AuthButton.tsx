import { ActivityIndicator, Pressable, Text } from "react-native";

type AuthButtonProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function AuthButton({
  label,
  loading = false,
  disabled = false,
  onPress,
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`mt-2 h-[54px] flex-row items-center justify-center rounded-xl bg-accent px-4 ${
        isDisabled ? "opacity-60" : "active:opacity-80"
      }`}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="font-sans-bold text-base text-white">{label}</Text>
      )}
    </Pressable>
  );
}
