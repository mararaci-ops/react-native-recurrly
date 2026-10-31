import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { SafeAreaViewStyled } from "@/constants/pages";
import { getAuthErrorMessage } from "@/lib/auth";
import { posthog, signOutWithTracking } from "@/lib/posthog";
import { formatoFechaString, formatoMoneda } from "@/lib/utils";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuth, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  View,
} from "react-native";

export default function App() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [currentDate, setCurrentDate] = useState(() => dayjs().startOf("day"));

  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout>;

    const updateCurrentDate = () => {
      setCurrentDate(dayjs().startOf("day"));
      clearTimeout(midnightTimeout);
      const millisecondsUntilMidnight = dayjs()
        .add(1, "day")
        .startOf("day")
        .diff(dayjs());
      midnightTimeout = setTimeout(
        updateCurrentDate,
        Math.max(millisecondsUntilMidnight + 50, 1),
      );
    };

    updateCurrentDate();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          updateCurrentDate();
        }
      },
    );

    return () => {
      clearTimeout(midnightTimeout);
      appStateSubscription.remove();
    };
  }, []);

  const upcomingSubscriptions = useMemo(() => {
    return subscriptions
      .filter((subscription) => {
        if (subscription.status !== "active" || !subscription.renewalDate) {
          return false;
        }

        const renewalDate = dayjs(subscription.renewalDate);
        return (
          renewalDate.isValid() &&
          !renewalDate.isBefore(currentDate, "day") &&
          dayjs(subscription.renewalDate)
            .startOf("day")
            .diff(currentDate, "month") <= 2
        );
      })
      .map((subscription) => ({
        ...subscription,
        daysLeft: Math.max(
          0,
          dayjs(subscription.renewalDate)
            .startOf("day")
            .diff(currentDate, "day"),
        ),
      }))
      .sort(
        (first, second) =>
          dayjs(first.renewalDate).valueOf() -
          dayjs(second.renewalDate).valueOf(),
      );
  }, [currentDate, subscriptions]);
  const subscriptionSections = [
    {
      key: "subscriptions",
      title: "All Subscriptions",
      data: subscriptions,
    },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      await signOutWithTracking(() => signOut());
    } catch (error) {
      setSignOutError(
        getAuthErrorMessage(
          error,
          "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  return (
    <SafeAreaViewStyled className="flex-1 bg-background p-5">
      <SectionList
        sections={subscriptionSections}
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
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-15"
        renderSectionHeader={({ section }) => (
          <ListHeading title={section.title} />
        )}
        ListFooterComponent={
          <View className="mt-8 mb-24">
            <Pressable
              className={`min-h-12 flex-row items-center justify-center rounded-xl border border-primary/10 bg-primary/5 px-4 ${
                isSigningOut ? "opacity-60" : "active:opacity-70"
              }`}
              onPress={handleSignOut}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              accessibilityState={{
                disabled: isSigningOut,
                busy: isSigningOut,
              }}
            >
              {isSigningOut ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="font-sans-semibold text-primary">
                  Cerrar sesión
                </Text>
              )}
            </Pressable>
            {signOutError ? (
              <Text className="mt-3 text-center font-sans text-destructive">
                {signOutError}
              </Text>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Create a subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatoMoneda(HOME_BALANCE.amount, "EUR")}
                </Text>
                <Text className="home-balance-date">
                  {formatoFechaString(HOME_BALANCE.nextRenewalDate)}
                </Text>
              </View>
            </View>

            <View className="mb-2">
              <ListHeading title={"Próximas"} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {upcomingSubscriptions.length > 0 ? (
                  upcomingSubscriptions.map((item) => (
                    <UpcomingSubscriptionCard key={item.id} {...item} />
                  ))
                ) : (
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        }
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={addSubscription}
      />
    </SafeAreaViewStyled>
  );
}
