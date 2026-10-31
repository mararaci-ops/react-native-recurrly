import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/components/SubscriptionProvider";
import { SafeAreaViewStyled } from "@/constants/pages";
import { posthog } from "@/lib/posthog";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type SortField = "name" | "price" | "billing" | "renewalDate";

const sortOptions: { label: string; value: SortField }[] = [
  { label: "Nombre", value: "name" },
  { label: "Precio", value: "price" },
  { label: "Frecuencia", value: "billing" },
  { label: "Renovación", value: "renewalDate" },
];

const Subscriptions = () => {
  const { subscriptions: allSubscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAscending, setSortAscending] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const subscriptions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return allSubscriptions
      .filter((subscription) =>
        [
          subscription.name,
          subscription.plan,
          subscription.category,
          subscription.billing,
        ].some((value) => value?.toLocaleLowerCase().includes(query)),
      )
      .sort((first, second) => {
        let comparison = 0;

        if (sortField === "name") {
          comparison = first.name.localeCompare(second.name);
        } else if (sortField === "price") {
          comparison = first.price - second.price;
        } else if (sortField === "billing") {
          comparison = first.billing.localeCompare(second.billing);
        } else {
          comparison =
            new Date(first.renewalDate ?? 0).getTime() -
            new Date(second.renewalDate ?? 0).getTime();
        }

        return sortAscending ? comparison : -comparison;
      });
  }, [allSubscriptions, searchQuery, sortAscending, sortField]);

  return (
    <SafeAreaViewStyled className="flex-1 bg-background p-5">
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              if (expandedSubscriptionId !== item.id) {
                posthog?.capture("subscription_details_expanded", {
                  category: item.category ?? null,
                  billing_interval: item.billing,
                  status: item.status ?? null,
                });
              }
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentContainerStyle={{
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 24 : 96,
        }}
        ListHeaderComponent={
          <View className="mb-5">
            <Text className="mb-5 text-2xl font-sans-bold text-primary">
              Mis Suscripciones
            </Text>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar suscripciones"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              accessibilityLabel="Buscar suscripciones"
              returnKeyType="search"
              className="mb-4 min-h-12 rounded-2xl border border-border bg-card px-4 font-sans text-primary"
            />

            <View className="flex-row items-center gap-2">
              <Text className="shrink-0 font-sans-semibold text-primary">
                Orden:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-1"
                contentContainerClassName="flex-row items-center gap-2"
              >
                {sortOptions.map((option) => {
                  const isSelected = sortField === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        if (isSelected) {
                          setSortAscending((ascending) => !ascending);
                        } else {
                          setSortField(option.value);
                          setSortAscending(true);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Sort by ${option.label}${
                        isSelected
                          ? sortAscending
                            ? ", ascending"
                            : ", descending"
                          : ""
                      }`}
                      accessibilityState={{ selected: isSelected }}
                      className={`shrink-0 rounded-full border px-3 py-2 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border bg-card"
                      }`}
                    >
                      <Text
                        className={`font-sans-semibold text-sm ${
                          isSelected ? "text-background" : "text-primary"
                        }`}
                      >
                        {option.label}
                        {isSelected ? (sortAscending ? " ↑" : " ↓") : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text className="py-8 text-center font-sans text-muted-foreground">
            No subscriptions match your search.
          </Text>
        }
      />
    </SafeAreaViewStyled>
  );
};

export default Subscriptions;
