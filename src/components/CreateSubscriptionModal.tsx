import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type SubscriptionCategory = (typeof categories)[number];
type SubscriptionFrequency = "Monthly" | "Yearly";

const categoryColors: Record<SubscriptionCategory, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f6d5bd",
  Cloud: "#cce4f6",
  Music: "#f6c6d0",
  Other: "#e8def8",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("Monthly");
  const [category, setCategory] =
    useState<SubscriptionCategory>("Entertainment");

  const parsedPrice = Number(price.trim().replace(",", "."));
  const isValid =
    name.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleCreate = () => {
    if (!isValid) return;

    const startDate = dayjs();
    const renewalDate = startDate.add(
      frequency === "Monthly" ? 1 : 12,
      "month",
    );
    const id = `subscription-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    onCreate({
      id,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
    });

    posthog?.capture("subscription_created", {
      billing_interval: frequency,
      subscription_name: name.trim(),
      subscription_price: price,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable className="modal-overlay justify-end" onPress={onClose}>
          <Pressable
            className="modal-container"
            onPress={(e): void => e.stopPropagation()}
          >
            <View className="modal-header">
              <Text className="modal-title">Nueva Suscripción</Text>
              <Pressable
                className="modal-close"
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">X</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="modal-body"
            >
              <View className="auth-field">
                <Text className="auth-label">Nombre</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="p.e. servicio Streaming"
                  placeholderTextColor="#77746B"
                  className="auth-input"
                  accessibilityLabel="Nombre Suscripción"
                  returnKeyType="next"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Precio</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#77746B"
                  keyboardType="decimal-pad"
                  className="auth-input"
                  accessibilityLabel="Precio Suscripción"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frecuencia</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => {
                    const active = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setFrequency(option)}
                        className={clsx(
                          "picker-option",
                          active && "picker-option-active",
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            active && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Categoria</Text>
                <View className="category-scroll">
                  {categories.map((option) => {
                    const active = category === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => setCategory(option)}
                        className={clsx(
                          "category-chip",
                          active && "category-chip-active",
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            active && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                onPress={handleCreate}
                disabled={!isValid}
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isValid }}
              >
                <Text className="auth-button-text">Crear Suscripción</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
