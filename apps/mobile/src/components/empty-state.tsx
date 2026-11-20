import type { SFSymbol } from "expo-symbols";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { SymbolIcon } from "./symbol-icon";

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

/** Where the state sits on a full page: above center, like a dialog. */
const TOP_FRACTION = 0.2;

/**
 * Every empty page and "nothing found" (docs/ui.md → Empty states): a small
 * muted symbol, a short title, and the actions there are, centered in the
 * upper part of the page. `compact` drops that offset, for a state below
 * other content or inside a sheet. `centered` sits it in the middle of the
 * screen, over the page, for a page with nothing else on it.
 */
export function EmptyState({
  icon,
  title,
  actions = [],
  compact = false,
  centered = false,
}: {
  icon: SFSymbol;
  title: string;
  actions?: readonly EmptyStateAction[];
  compact?: boolean;
  centered?: boolean;
}) {
  const { height } = useWindowDimensions();
  return (
    <View
      className={`items-center gap-2.5 px-10 ${centered ? "pointer-events-none absolute inset-0 justify-center" : ""}`}
      style={
        centered
          ? undefined
          : { paddingTop: compact ? 24 : Math.round(height * TOP_FRACTION) }
      }
    >
      <SymbolIcon name={icon} size={26} tintColorClassName="accent-subtle" />
      <Text className="text-subhead text-muted text-center font-medium">
        {title}
      </Text>
      {actions.length > 0 && (
        <View className="items-stretch gap-2 pt-3">
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              className="bg-fill h-10 items-center justify-center rounded-full px-6 active:opacity-70"
              onPress={action.onPress}
            >
              <Text className="text-subhead text-foreground font-medium">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
