import TabIconLayout from "@/components/TabIconLayout";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import { tabs } from "@/constants/data";
import {
  retrySubscriptionHydration,
  useSubscriptionStore,
} from "@/store/subscriptionStore";
import { colors, components } from "@/constants/theme";
import { useAuth, useUser } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const tabBar = components.tabBar;
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const activeAccountId = useSubscriptionStore(
    (state) => state.activeAccountId,
  );
  const hasHydrated = useSubscriptionStore((state) => state.hasHydrated);
  const hydrationError = useSubscriptionStore((state) => state.hydrationError);
  const setActiveAccountId = useSubscriptionStore(
    (state) => state.setActiveAccountId,
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isLoaded && userLoaded && hasHydrated && !hydrationError) {
      setActiveAccountId(isSignedIn ? (user?.id ?? null) : null);
    }
  }, [
    hasHydrated,
    hydrationError,
    isLoaded,
    isSignedIn,
    setActiveAccountId,
    user?.id,
    userLoaded,
  ]);

  // const TabIcon = ({ focused, icon }: TabIconProps) => {
  //   return (
  //     <View className="tabs-icon">
  //       <View className={clsx("tabs-pill", focused && "tabs-active")}>
  //         <Image source={icon} resizeMode="contain" className="tabs-glyph" />
  //       </View>
  //     </View>
  //   );
  // };
  if (!isLoaded || !userLoaded) {
    return <AuthLoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (hydrationError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-center font-sans text-primary">
          No se pudieron recuperar las suscripciones guardadas.
        </Text>
        <Pressable
          onPress={() => void retrySubscriptionHydration()}
          className="rounded-xl bg-accent px-5 py-3"
          accessibilityRole="button"
          accessibilityLabel="Reintentar recuperación de suscripciones"
        >
          <Text className="font-sans-semibold text-primary">Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasHydrated) {
    return <AuthLoadingScreen />;
  }

  if (!user || activeAccountId !== user.id) {
    return <AuthLoadingScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.itemPaddingVertical,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIconLayout focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="subscriptions/[id]" options={{ href: null }} />
    </Tabs>
  );
}
