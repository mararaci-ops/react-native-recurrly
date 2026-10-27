import { Text, TextInput, View, type TextInputProps } from "react-native";

type AuthFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  return (
    <View className="gap-2">
      {label ? (
        <Text className="font-sans-semibold text-sm text-primary">{label}</Text>
      ) : null}
      <TextInput
        {...inputProps}
        className="h-[52px] rounded-xl border border-border bg-background px-4 font-sans text-[15px] text-primary"
        placeholderTextColor="#77746B"
        selectionColor="#ea7a53"
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
        autoCorrect={false}
      />
      {error ? (
        <Text className="font-sans text-sm text-destructive">{error}</Text>
      ) : null}
    </View>
  );
}
