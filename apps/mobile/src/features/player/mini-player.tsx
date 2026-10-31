import type { SongListItem } from "@synq/db";
import { Pressable, Text, View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { router } from "expo-router";

import { Artwork } from "~/components/artwork";
import { SymbolIcon } from "~/components/symbol-icon";
import { cn } from "~/lib/cn";
import { lightImpact } from "~/lib/haptics";
import { skipToNext, togglePlayback } from "./commands";
import { usePlayer } from "./hooks";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";

/**
 * The tab bar's bottom accessory, like Apple Music's: what's playing, with
 * play/pause and next; a tap opens the player. Inline (the tab bar
 * minimized while scrolling) it drops the artist line.
 */
export function MiniPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const songId = usePlayer((state) => state.current?.songId ?? null);
  const interstitial = usePlayer((state) => state.interstitial);
  const playing = usePlayer((state) => isPlaying(state.status));
  const shown = describe(useCurrentSong(songId), interstitial);
  return (
    <View className="flex-1 flex-row items-center gap-1 pr-2 pl-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={shown.empty ? shown.title : `${shown.title}, open player`}
        className="flex-1 flex-row items-center gap-3 self-stretch active:opacity-70"
        disabled={shown.empty}
        onPress={() => router.push("/player")}
      >
        <Artwork artwork={shown.artwork} placeholder="song" size={32} />
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className={cn(
              "text-footnote",
              shown.empty ? "text-muted" : "text-foreground font-semibold",
            )}
          >
            {shown.title}
          </Text>
          {placement === "regular" && shown.subtitle !== null && (
            <Text numberOfLines={1} className="text-caption text-muted">
              {shown.subtitle}
            </Text>
          )}
        </View>
      </Pressable>
      <ControlButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        disabled={shown.empty}
        onPress={togglePlayback}
      />
      <ControlButton
        label="Next"
        symbol="forward.fill"
        disabled={shown.empty || interstitial}
        onPress={skipToNext}
      />
    </View>
  );
}

/** What the accessory shows: the song, the ad, or Not Playing. */
function describe(song: SongListItem | null, interstitial: boolean) {
  if (interstitial) {
    return { artwork: null, empty: false, subtitle: "SYNQ", title: "Premium Ad" };
  }
  if (song === null) {
    return { artwork: null, empty: true, subtitle: null, title: "Not Playing" };
  }
  return {
    artwork: song.artwork,
    empty: false,
    subtitle: artistLine(song),
    title: song.title,
  };
}

function ControlButton({
  label,
  symbol,
  disabled,
  onPress,
}: {
  label: string;
  symbol: "play.fill" | "pause.fill" | "forward.fill";
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={6}
      className="size-9 items-center justify-center rounded-full active:bg-white/10"
      onPress={() => {
        lightImpact();
        onPress();
      }}
    >
      <SymbolIcon
        name={symbol}
        size={20}
        tintColorClassName={disabled ? "accent-subtle" : "accent-foreground"}
      />
    </Pressable>
  );
}
