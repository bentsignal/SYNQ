import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "expo-router";

import type { SongListItem } from "@synq/db";

import { usePlayer } from "./hooks";
import { LikeButton } from "./like-button";
import { MarqueeText } from "./marquee-text";
import { PlayerArtwork } from "./player-artwork";
import { PlayerBackdrop } from "./player-backdrop";
import { PlayerOptions, Transport } from "./player-controls";
import { Scrubber } from "./scrubber";
import { SongMenuButton } from "./song-menu-button";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";

/** The artwork spans the screen less this. */
const ARTWORK_INSET = 64;

/**
 * The full player (a modal sheet; swipe down to close): the artwork over
 * its own blurred backdrop, the song, the scrubber, and the controls.
 */
export function PlayerScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const entryKey = usePlayer((state) => state.current?.key ?? null);
  const songId = usePlayer((state) => state.current?.songId ?? null);
  const playing = usePlayer((state) => isPlaying(state.status));
  const song = useCurrentSong(songId);
  const artwork = song?.artwork ?? null;
  return (
    <View className="flex-1">
      <PlayerBackdrop artwork={artwork} />
      <View
        className="flex-1 gap-6 px-8 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="h-1.5 w-10 self-center rounded-full bg-white/30" />
        <View className="flex-1 items-center justify-center">
          <PlayerArtwork
            artwork={artwork}
            playing={playing}
            size={width - ARTWORK_INSET}
          />
        </View>
        <SongTitle song={song} entryKey={entryKey} />
        <Scrubber
          // A new song starts with a fresh scrubber.
          key={entryKey}
          disabled={song === null}
          fallbackDurationMs={song?.durationMs ?? 0}
        />
        <Transport />
        <PlayerOptions />
      </View>
    </View>
  );
}

function SongTitle({
  song,
  entryKey,
}: {
  song: SongListItem | null;
  entryKey: string | null;
}) {
  // Not moving under the queue sheet or behind anything else.
  const focused = useIsFocused();
  const title = song?.title ?? "Not Playing";
  const artist = song === null ? "" : artistLine(song);
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 gap-0.5">
        <MarqueeText
          // A new song starts from the beginning of both lines.
          key={`title-${entryKey}`}
          text={title}
          active={focused}
          className="text-title-3 text-foreground font-semibold"
        />
        <MarqueeText
          key={`artist-${entryKey}`}
          text={artist}
          active={focused}
          className="text-callout text-muted"
        />
      </View>
      {song !== null && (
        <>
          <LikeButton songId={song.id} />
          <SongMenuButton song={song} />
        </>
      )}
    </View>
  );
}
