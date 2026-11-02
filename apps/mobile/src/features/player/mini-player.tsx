import { Pressable, View } from "react-native";
import { router, useIsFocused } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import type { SongListItem } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { SymbolIcon } from "~/components/symbol-icon";
import { cn } from "~/lib/cn";
import { lightImpact } from "~/lib/haptics";
import { skipToNext, skipToPrevious, togglePlayback } from "./commands";
import { usePlayer } from "./hooks";
import { MarqueeText } from "./marquee-text";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";

/**
 * The tab bar's bottom accessory: what's playing, with previous, play/pause,
 * and next; a tap opens the player. Inline (the tab bar minimized while
 * scrolling) there's less room, so it drops the artist line and previous.
 */
export function MiniPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const entryKey = usePlayer((state) => state.current?.key ?? null);
  const songId = usePlayer((state) => state.current?.songId ?? null);
  // Covered by the player or the queue: nothing to see, so nothing moves.
  const focused = useIsFocused();
  const playing = usePlayer((state) => isPlaying(state.status));
  const shown = describe(useCurrentSong(songId));
  return (
    <View className="flex-1 flex-row items-center pr-2 pl-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          shown.empty ? shown.title : `${shown.title}, open player`
        }
        className="flex-1 flex-row items-center gap-3 self-stretch pr-1 active:opacity-70"
        disabled={shown.empty}
        onPress={() => router.push("/player")}
      >
        <Artwork artwork={shown.artwork} placeholder="song" size={32} />
        <View className="flex-1">
          <MarqueeText
            key={`title-${entryKey}`}
            text={shown.title}
            active={focused && !shown.empty}
            className={cn(
              "text-footnote",
              shown.empty ? "text-muted" : "text-foreground font-semibold",
            )}
          />
          {placement === "regular" && shown.subtitle !== null && (
            <MarqueeText
              key={`artist-${entryKey}`}
              text={shown.subtitle}
              active={focused}
              className="text-caption text-muted"
            />
          )}
        </View>
      </Pressable>
      {placement === "regular" && (
        <ControlButton
          label="Previous"
          symbol="backward.fill"
          disabled={shown.empty}
          onPress={skipToPrevious}
        />
      )}
      <ControlButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        disabled={shown.empty}
        onPress={togglePlayback}
      />
      <ControlButton
        label="Next"
        symbol="forward.fill"
        disabled={shown.empty}
        onPress={skipToNext}
      />
    </View>
  );
}

/** What the accessory shows: the song, or Not Playing. */
function describe(song: SongListItem | null) {
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
  symbol: "backward.fill" | "play.fill" | "pause.fill" | "forward.fill";
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={{ bottom: 6, top: 6 }}
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
