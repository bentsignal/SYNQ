import type { SFSymbol } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { cn } from "~/lib/cn";
import { SymbolIcon } from "./symbol-icon";

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

/**
 * `ContentUnavailableView`'s look: a large muted symbol, a title, an
 * optional line, and the actions there are (docs/ui.md → Empty states).
 */
export function EmptyState({
  icon,
  title,
  message,
  actions = [],
  className,
}: {
  icon: SFSymbol;
  title: string;
  message?: string;
  actions?: readonly EmptyStateAction[];
  className?: string;
}) {
  return (
    <View className={cn("items-center justify-center gap-4 px-10", className)}>
      <SymbolIcon name={icon} size={48} tintColorClassName="accent-subtle" />
      <View className="items-center gap-1">
        <Text className="text-title text-foreground text-center font-bold">
          {title}
        </Text>
        {message !== undefined && (
          <Text className="text-body text-muted text-center">{message}</Text>
        )}
      </View>
      {actions.length > 0 && (
        <View className="items-center gap-3 pt-1">
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              className="bg-fill min-w-48 items-center rounded-full px-6 py-3 active:opacity-70"
              onPress={action.onPress}
            >
              <Text className="text-body text-accent font-semibold">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
