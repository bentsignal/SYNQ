import { useState } from "react";
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
import { playerSpacing } from "./player-layout";
import { Scrubber } from "./scrubber";
import { SongMenuButton } from "./song-menu-button";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";
import { VolumeSlider } from "./volume-slider";

/** The artwork spans the screen less this. */
const ARTWORK_INSET = 64;
/** At least this much between the artwork and what's above and below it. */
const ARTWORK_MARGIN = 12;

/**
 * The full player (a modal sheet; swipe down to close): the artwork over
 * its own blurred backdrop, the song, the scrubber, and the controls.
 */
export function PlayerScreen() {
  const { height, width } = useWindowDimensions();
  // Short phones and large text: the artwork gives way before the controls.
  const [artworkRoom, setArtworkRoom] = useState(Infinity);
  const insets = useSafeAreaInsets();
  const entryKey = usePlayer((state) => state.current?.key ?? null);
  const songId = usePlayer((state) => state.current?.songId ?? null);
  const playing = usePlayer((state) => isPlaying(state.status));
  const song = useCurrentSong(songId);
  const artwork = song?.artwork ?? null;
  const spacing = playerSpacing(height);
  return (
    <View className="flex-1">
      <PlayerBackdrop artwork={artwork} />
      <View
        className="flex-1 px-8 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="h-1.5 w-10 self-center rounded-full bg-white/30" />
        <View
          className="flex-1 items-center justify-center"
          onLayout={(event) =>
            setArtworkRoom(event.nativeEvent.layout.height - ARTWORK_MARGIN * 2)
          }
        >
          <PlayerArtwork
            artwork={artwork}
            playing={playing}
            size={Math.min(width - ARTWORK_INSET, artworkRoom)}
          />
        </View>
        <SongTitle song={song} entryKey={entryKey} />
        <View style={{ marginTop: spacing.titleToScrubber }}>
          <Scrubber
            // A new song starts with a fresh scrubber.
            key={entryKey}
            disabled={song === null}
            fallbackDurationMs={song?.durationMs ?? 0}
          />
        </View>
        <View style={{ marginVertical: spacing.sliderToTransport }}>
          <Transport />
        </View>
        <VolumeSlider />
        <View style={{ marginTop: spacing.volumeToOptions }}>
          <PlayerOptions />
        </View>
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
    <View className="flex-row items-center">
      <View className="flex-1 gap-0.5 pr-2">
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
