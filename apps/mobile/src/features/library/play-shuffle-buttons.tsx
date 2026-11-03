import type { SFSymbol } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { PlaybackSource } from "~/features/player/actions";
import { SymbolIcon } from "~/components/symbol-icon";
import { playSongs } from "~/features/player/actions";
import { lightImpact } from "~/lib/haptics";

function Capsule({
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
      className="bg-fill h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full active:opacity-70"
      onPress={() => {
        lightImpact();
        onPress();
      }}
    >
      <SymbolIcon name={icon} size={16} tintColorClassName="accent-accent" />
      <Text className="text-body text-accent font-semibold">{label}</Text>
    </Pressable>
  );
}

/**
 * Play and Shuffle at the top of every song collection: two equal
 * capsules on `fill` with the accent symbol and label. `songIds` is read
 * when tapped, in the order shown.
 */
export function PlayShuffleButtons({
  songIds,
  source,
  className,
}: {
  songIds: () => readonly number[];
  source: PlaybackSource;
  className?: string;
}) {
  return (
    <View className={className ?? "flex-row gap-3 px-4 pt-2 pb-3"}>
      <Capsule
        icon="play.fill"
        label="Play"
        onPress={() => playSongs(songIds(), { source })}
      />
      <Capsule
        icon="shuffle"
        label="Shuffle"
        onPress={() => playSongs(songIds(), { shuffle: true, source })}
      />
    </View>
  );
}
