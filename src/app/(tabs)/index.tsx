import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { SafeAreaViewStyled } from "@/constants/pages";
import { formatoFechaString, formatoMoneda } from "@/lib/utils";
import { useState } from "react";
import { Image, ScrollView, SectionList, Text, View } from "react-native";

const subscriptionSections = [
  {
    key: "subscriptions",
    title: "Todas las suscripciones",
    data: HOME_SUBSCRIPTIONS,
  },
];

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  return (
    <SafeAreaViewStyled className="flex-1 bg-background p-5">
      <SectionList
        sections={subscriptionSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-15"
        renderSectionHeader={({ section }) => (
          <ListHeading title={section.title} />
        )}
        ListHeaderComponent={
          <View>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>
              <Image source={icons.add} className="home-add-icon" />
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

            <View className="mb-5">
              <ListHeading title={"Próximas"} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {UPCOMING_SUBSCRIPTIONS.length > 0 ? (
                  UPCOMING_SUBSCRIPTIONS.map((item) => (
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
    </SafeAreaViewStyled>
  );
}
