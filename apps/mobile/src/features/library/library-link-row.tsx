import type { SFSymbol } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { SymbolIcon } from "~/components/symbol-icon";

/**
 * A row that opens a library list: the accent symbol, its label, and a
 * chevron, with a hairline under the label as in Apple Music.
 */
export function LibraryLinkRow({
  icon,
  label,
  onPress,
}: {
  icon: SFSymbol;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="active:bg-fill h-13 flex-row items-center pl-4"
      onPress={onPress}
    >
      <View className="w-8 items-center">
        <SymbolIcon name={icon} size={22} tintColorClassName="accent-accent" />
      </View>
      <View className="border-b-hairline border-separator ml-3 h-full flex-1 flex-row items-center pr-4">
        <Text className="text-foreground flex-1 text-[20px]">{label}</Text>
        <SymbolIcon
          name="chevron.right"
          size={13}
          weight="semibold"
          tintColorClassName="accent-subtle"
        />
      </View>
    </Pressable>
  );
}
