import type { SymbolViewProps } from "expo-symbols";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
// eslint-disable-next-line no-restricted-imports -- Prices come from the App Store over the network, so the paywall needs the query's pending and error states (and a retry), not a suspense read.
import { useQuery } from "@tanstack/react-query";

import type { Plan } from "~/features/premium/config";
import type { PaywallPlan } from "~/features/premium/purchases";
import type { PremiumStatus } from "~/features/premium/status";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import {
  PLAN_OFFERINGS,
  PLANS,
  PRIVACY_URL,
  TERMS_URL,
} from "~/features/premium/config";
import { usePremium } from "~/features/premium/premium";
import { ProminentButton } from "~/features/premium/prominent-button";
import {
  introPeriod,
  loadPaywallPlans,
  purchasePlan,
  restorePremium,
} from "~/features/premium/purchases";
import { cn } from "~/lib/cn";
import { successFeedback } from "~/lib/haptics";
import hero from "../../assets/images/premium-hero.png";

const FEATURES = [
  { icon: "speaker.slash", title: "Ad-Free Listening" },
  { icon: "square.and.arrow.down.on.square", title: "Bulk Import and Export" },
  { icon: "paintpalette", title: "Themes and App Icons" },
  { icon: "externaldrive", title: "Backup and Restore" },
] as const satisfies readonly { icon: SymbolViewProps["name"]; title: string }[];

const PLAN_NAMES = {
  lifetime: "Lifetime",
  monthly: "Monthly",
  yearly: "Yearly",
} as const satisfies Record<Plan, string>;

const PER = { lifetime: "once", monthly: "a month", yearly: "a year" } as const;

/** "3 months free, then $19.99 a year". */
function priceLine(choice: PaywallPlan) {
  const regular = `${choice.price} ${PER[choice.plan]}`;
  if (choice.intro === null) return regular;
  const period = introPeriod(choice.intro).toLowerCase();
  return choice.intro.price === 0
    ? `${period} free, then ${regular}`
    : `${choice.intro.priceString} for ${period}, then ${regular}`;
}

/** The button's label: the plan, a trial, or the plan someone has. */
function actionLabel(choice: PaywallPlan | undefined, status: PremiumStatus) {
  if (status.active && choice?.plan === status.plan) return "Current Plan";
  if (choice === undefined) return "Subscribe";
  if (choice.plan === "lifetime") return "Buy Lifetime";
  if (choice.intro !== null) {
    return choice.intro.price === 0
      ? `Try ${introPeriod(choice.intro)} Free`
      : `Start for ${choice.intro.priceString}`;
  }
  return "Subscribe";
}

function plansOf(plans: PaywallPlan[]) {
  return plans;
}

function statusOf(status: PremiumStatus) {
  return status;
}

function PlanCard({
  plan,
  choice,
  selected,
  onPress,
}: {
  plan: Plan;
  choice: PaywallPlan | undefined;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "bg-fill min-h-[68px] flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3",
        selected ? "border-accent" : "border-transparent",
      )}
    >
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-headline text-foreground font-semibold">
            {PLAN_NAMES[plan]}
          </Text>
          {plan === "yearly" && (
            <View className="bg-accent rounded-full px-2 py-0.5">
              <Text className="text-caption font-semibold text-[#141414]">
                Best Value
              </Text>
            </View>
          )}
        </View>
        {choice !== undefined && (
          <Animated.Text
            entering={FadeIn.duration(200)}
            className="text-subhead text-muted"
          >
            {priceLine(choice)}
          </Animated.Text>
        )}
      </View>
      <SymbolIcon
        name={selected ? "checkmark.circle.fill" : "circle"}
        size={22}
        tintColorClassName={selected ? "accent-accent" : "accent-subtle"}
      />
    </Pressable>
  );
}

/**
 * The paywall: 2.5.2's eclipse, what Premium gives, the three plans priced
 * by the App Store (Yearly selected), and a button that follows the plan
 * and the person's trial eligibility.
 */
export default function PremiumScreen() {
  const router = useRouter();
  const status = usePremium(statusOf);
  const plans = useQuery({
    queryFn: loadPaywallPlans,
    queryKey: ["premium", "plans"],
    select: plansOf,
  });
  const [selected, setSelected] = useState<Plan>(
    status.active && status.plan !== null ? status.plan : "yearly",
  );
  const [buying, setBuying] = useState(false);
  // A purchase or restore at a time; the App Store sheet takes a moment.
  const busy = useRef(false);
  const choice = plans.data?.find((plan) => plan.plan === selected);

  function buy() {
    if (choice === undefined || busy.current) return;
    busy.current = true;
    setBuying(true);
    purchasePlan(choice).then(
      (outcome) => {
        busy.current = false;
        setBuying(false);
        if (outcome === "purchased") {
          successFeedback();
          router.back();
        }
      },
      () => {
        busy.current = false;
        setBuying(false);
        Alert.alert("Couldn't Complete Purchase", "Try again.");
      },
    );
  }

  function restore() {
    if (busy.current) return;
    busy.current = true;
    restorePremium().then(
      (active) => {
        busy.current = false;
        if (active) {
          successFeedback();
          Alert.alert("Purchases Restored", "SYNQ Premium is active.");
          router.back();
        } else {
          Alert.alert(
            "No Purchases Found",
            "This Apple Account hasn't bought SYNQ Premium.",
          );
        }
      },
      () => {
        busy.current = false;
        Alert.alert("Couldn't Restore Purchases", "Try again.");
      },
    );
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ aspectRatio: 1500 / 700, width: "100%" }}>
        <Image
          source={hero}
          style={{ height: "100%", width: "100%" }}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
        <LinearGradient
          colors={["#14141400", "#141414"]}
          style={{ bottom: 0, height: "45%", left: 0, position: "absolute", right: 0 }}
        />
      </View>
      <View className="-mt-4 gap-7 px-5">
        <Text className="text-large-title text-foreground font-bold">
          SYNQ Premium
        </Text>
        <View className="gap-4">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row items-center gap-4">
              <View className="w-7 items-center">
                <SymbolIcon
                  name={feature.icon}
                  size={20}
                  tintColorClassName="accent-accent"
                />
              </View>
              <Text className="text-body text-foreground">{feature.title}</Text>
            </View>
          ))}
        </View>
        <View className="gap-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan}
              plan={plan}
              choice={plans.data?.find((option) => option.plan === plan)}
              selected={selected === plan}
              onPress={() => {
                setSelected(plan);
                const option = plans.data?.find((item) => item.plan === plan);
                track("premium_option_press", {
                  price: option?.price ?? null,
                  tier: PLAN_OFFERINGS[plan],
                });
              }}
            />
          ))}
          {plans.isError && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void plans.refetch()}
              className="items-center py-2"
            >
              <Text className="text-subhead text-muted">
                Couldn&apos;t load prices.{" "}
                <Text className="text-accent">Try Again</Text>
              </Text>
            </Pressable>
          )}
        </View>
        <ProminentButton
          label={actionLabel(choice, status)}
          loading={buying}
          disabled={
            choice === undefined || (status.active && choice.plan === status.plan)
          }
          onPress={buy}
        />
        <View className="flex-row items-center justify-center gap-3">
          <Text className="text-footnote text-muted" onPress={restore}>
            Restore
          </Text>
          <Text className="text-footnote text-subtle">·</Text>
          <Text
            className="text-footnote text-muted"
            onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)}
          >
            Terms
          </Text>
          <Text className="text-footnote text-subtle">·</Text>
          <Text
            className="text-footnote text-muted"
            onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}
          >
            Privacy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
