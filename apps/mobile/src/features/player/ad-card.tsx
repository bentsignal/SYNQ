import { Image, Pressable, Text, View } from "react-native";

import icon from "../../../assets/icons/icon-blue.png";
import { openPaywall } from "./premium-gate";

/**
 * In place of the artwork while the free tier's ad plays: the SYNQ mark,
 * the offer, and Learn More (the paywall).
 */
export function AdCard({ size }: { size: number }) {
  return (
    <View
      className="bg-background-elevated items-center justify-center gap-5 rounded-xl px-10"
      style={{ height: size, width: size }}
    >
      <Image
        source={icon}
        accessibilityIgnoresInvertColors
        style={{ borderRadius: 18, height: 80, width: 80 }}
      />
      <Text className="text-title text-foreground text-center font-semibold">
        Listen ad-free with Premium
      </Text>
      <Pressable
        accessibilityRole="button"
        className="bg-accent rounded-full px-6 py-3 active:opacity-80"
        onPress={openPaywall}
      >
        <Text className="text-body text-on-accent font-semibold">
          Learn More
        </Text>
      </Pressable>
    </View>
  );
}
