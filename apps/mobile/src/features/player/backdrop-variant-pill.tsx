import { Pressable, Text } from "react-native";

import { lightImpact } from "~/lib/haptics";
import {
  cycleBackdropVariant,
  useBackdropVariant,
} from "./backdrop-variant-store";

/** The experiment's switch, at the player's top corner, in dev builds. */
export function BackdropVariantPill() {
  const variant = useBackdropVariant();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Backdrop: ${variant.label}`}
      className="absolute top-1.5 right-3 z-10 rounded-full bg-black/35 px-2.5 py-1"
      hitSlop={10}
      onPress={() => {
        lightImpact();
        cycleBackdropVariant();
      }}
    >
      <Text className="text-caption font-semibold text-white">
        {variant.label}
      </Text>
    </Pressable>
  );
}
