import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SubscriptionState = {
  activeAccountId: string | null;
  hasHydrated: boolean;
  hydrationError: string | null;
  subscriptions: Subscription[];
  subscriptionsByAccount: Record<string, Subscription[]>;
  setActiveAccountId: (accountId: string | null) => void;
  setHydrationStatus: (hasHydrated: boolean, error: string | null) => void;
  addSubscription: (subscription: Subscription) => void;
};

type PersistedSubscriptionState = Pick<
  SubscriptionState,
  "subscriptionsByAccount"
>;

export const useSubscriptionStore = create<SubscriptionState>()(
  persist<
    SubscriptionState,
    [],
    [],
    PersistedSubscriptionState
  >(
    (set) => ({
      activeAccountId: null,
      hasHydrated: false,
      hydrationError: null,
      subscriptions: [],
      subscriptionsByAccount: {},
      setActiveAccountId: (accountId) =>
        set((state) => {
          if (state.activeAccountId === accountId) return state;
          if (accountId === null) {
            return { activeAccountId: null, subscriptions: [] };
          }

          const accountSubscriptions =
            state.subscriptionsByAccount[accountId] ??
            HOME_SUBSCRIPTIONS.map((subscription) => ({ ...subscription }));
          const subscriptionsByAccount = state.subscriptionsByAccount[accountId]
            ? state.subscriptionsByAccount
            : {
                ...state.subscriptionsByAccount,
                [accountId]: accountSubscriptions,
              };

          return {
            activeAccountId: accountId,
            subscriptions: accountSubscriptions,
            subscriptionsByAccount,
          };
        }),
      setHydrationStatus: (hasHydrated, error) =>
        set({ hasHydrated, hydrationError: error }),
      addSubscription: (subscription) =>
        set((state) => {
          if (!state.activeAccountId) {
            throw new Error(
              "Cannot add a subscription without an active account",
            );
          }

          const accountSubscriptions = [
            subscription,
            ...state.subscriptions,
          ];

          return {
            subscriptions: accountSubscriptions,
            subscriptionsByAccount: {
              ...state.subscriptionsByAccount,
              [state.activeAccountId]: accountSubscriptions,
            },
          };
        }),
    }),
    {
      name: "recurly-subscriptions-by-account",
      storage: createJSONStorage<PersistedSubscriptionState>(() => ({
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: async (name, value) => {
          try {
            await AsyncStorage.setItem(name, value);
          } catch (error) {
            console.error("Failed to persist account subscriptions", error);
          }
        },
        removeItem: (name) => AsyncStorage.removeItem(name),
      })),
      partialize: (state) => ({
        subscriptionsByAccount: state.subscriptionsByAccount,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error("Failed to restore account subscriptions", error);
          useSubscriptionStore
            .getState()
            .setHydrationStatus(true, message);
          return;
        }

        state?.setHydrationStatus(true, null);
      },
    },
  ),
);

export function retrySubscriptionHydration() {
  useSubscriptionStore.getState().setHydrationStatus(false, null);
  return useSubscriptionStore.persist.rehydrate();
}
