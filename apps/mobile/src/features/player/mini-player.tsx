import { Pressable, View } from "react-native";
import { router, useIsFocused } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import type { SongListItem } from "@synq/db";

import { SeamlessArtwork } from "~/components/artwork";
import { cn } from "~/lib/cn";
import { skipToNext, skipToPrevious, togglePlayback } from "./commands";
import { usePlayer } from "./hooks";
import { IconButton } from "./icon-button";
import { MarqueeText } from "./marquee-text";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";

const CONTROL_SIZE = 20;
/** Only up and down: sideways they'd reach the title and each other. */
const CONTROL_SLOP = { bottom: 6, top: 6 };

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
        <SeamlessArtwork artwork={shown.artwork} placeholder="song" size={32} />
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
        <IconButton
          label="Previous"
          symbol="backward.fill"
          size={CONTROL_SIZE}
          hitSlop={CONTROL_SLOP}
          disabled={shown.empty}
          onPress={skipToPrevious}
        />
      )}
      <IconButton
        label={playing ? "Pause" : "Play"}
        symbol={playing ? "pause.fill" : "play.fill"}
        size={CONTROL_SIZE}
        hitSlop={CONTROL_SLOP}
        disabled={shown.empty}
        onPress={togglePlayback}
      />
      <IconButton
        label="Next"
        symbol="forward.fill"
        size={CONTROL_SIZE}
        hitSlop={CONTROL_SLOP}
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
