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

import type { Plan } from "./config";
import type { PaywallPlan } from "./purchases";
import type { PremiumStatus } from "./status";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { cn } from "~/lib/cn";
import { successFeedback } from "~/lib/haptics";
import hero from "../../../assets/images/premium-hero.png";
import { PLAN_OFFERINGS, PLANS, PRIVACY_URL, TERMS_URL } from "./config";
import { usePremiumStatus } from "./premium";
import { ProminentButton } from "./prominent-button";
import {
  introPeriod,
  loadPaywallPlans,
  purchasePlan,
  restorePremium,
} from "./purchases";

const FEATURES = [
  { icon: "speaker.slash", title: "Ad-Free Listening" },
  { icon: "square.and.arrow.down.on.square", title: "Bulk Import and Export" },
  { icon: "paintpalette", title: "Themes and App Icons" },
  { icon: "externaldrive", title: "Backup and Restore" },
] as const satisfies readonly {
  icon: SymbolViewProps["name"];
  title: string;
}[];

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

function Hero() {
  return (
    <View style={{ aspectRatio: 1500 / 700, width: "100%" }}>
      <Image
        source={hero}
        style={{ height: "100%", width: "100%" }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={["#14141400", "#141414"]}
        style={{
          bottom: 0,
          height: "45%",
          left: 0,
          position: "absolute",
          right: 0,
        }}
      />
    </View>
  );
}

function Features() {
  return (
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
  );
}

function FooterLinks({ onRestore }: { onRestore: () => void }) {
  return (
    <View className="flex-row items-center justify-center gap-3">
      <Text className="text-footnote text-muted" onPress={onRestore}>
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
  );
}

/** Buying a plan and restoring purchases, one at a time; success closes the paywall. */
function usePaywallActions() {
  const router = useRouter();
  const [buying, setBuying] = useState(false);
  // The App Store sheet takes a moment; a second tap must not start another.
  const busy = useRef(false);

  function buy(choice: PaywallPlan | undefined) {
    if (choice === undefined || busy.current) return;
    busy.current = true;
    setBuying(true);
    purchasePlan(choice).then(
      (outcome) => {
        busy.current = false;
        setBuying(false);
        if (outcome !== "purchased") return;
        successFeedback();
        router.back();
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
        if (!active) {
          Alert.alert(
            "No Purchases Found",
            "This Apple Account hasn't bought SYNQ Premium.",
          );
          return;
        }
        successFeedback();
        Alert.alert("Purchases Restored", "SYNQ Premium is active.");
        router.back();
      },
      () => {
        busy.current = false;
        Alert.alert("Couldn't Restore Purchases", "Try again.");
      },
    );
  }

  return { buy, buying, restore };
}

function pressedPlan(plan: Plan, options: PaywallPlan[] | undefined) {
  track("premium_option_press", {
    price: options?.find((item) => item.plan === plan)?.price ?? null,
    tier: PLAN_OFFERINGS[plan],
  });
}

/**
 * The paywall: 2.5.2's eclipse, what Premium gives, the three plans priced
 * by the App Store (Yearly selected), and a button that follows the plan
 * and the person's trial eligibility.
 */
export function Paywall() {
  const status = usePremiumStatus(statusOf);
  const plans = useQuery({
    queryFn: loadPaywallPlans,
    queryKey: ["premium", "plans"],
    select: plansOf,
  });
  const [selected, setSelected] = useState<Plan>(
    status.active && status.plan !== null ? status.plan : "yearly",
  );
  const { buy, buying, restore } = usePaywallActions();
  const choice = plans.data?.find((plan) => plan.plan === selected);
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
    >
      <Hero />
      <View className="-mt-4 gap-7 px-5">
        <Text className="text-large-title text-foreground font-bold">
          SYNQ Premium
        </Text>
        <Features />
        <View className="gap-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan}
              plan={plan}
              choice={plans.data?.find((option) => option.plan === plan)}
              selected={selected === plan}
              onPress={() => {
                setSelected(plan);
                pressedPlan(plan, plans.data);
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
            choice === undefined ||
            (status.active && choice.plan === status.plan)
          }
          onPress={() => buy(choice)}
        />
        <FooterLinks onRestore={restore} />
      </View>
    </ScrollView>
  );
}
