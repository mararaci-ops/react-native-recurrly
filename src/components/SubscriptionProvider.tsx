import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type SubscriptionContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((currentSubscriptions) => [
      subscription,
      ...currentSubscriptions,
    ]);
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionProvider",
    );
  }

  return context;
}
