import type { SongListItem } from "@synq/db";
import { Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePlayer } from "./hooks";
import { IconButton } from "./icon-button";
import { LikeButton } from "./like-button";
import { PlayerArtwork } from "./player-artwork";
import { PlayerBackdrop } from "./player-backdrop";
import { PlayerOptions, Transport } from "./player-controls";
import { Scrubber } from "./scrubber";
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
  const interstitial = usePlayer((state) => state.interstitial);
  const playing = usePlayer((state) => isPlaying(state.status));
  const song = useCurrentSong(songId);
  const artwork = song?.artwork ?? null;
  return (
    <View className="flex-1">
      <PlayerBackdrop artwork={interstitial ? null : artwork} />
      <View
        className="flex-1 gap-6 px-8 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="h-1.5 w-10 self-center rounded-full bg-white/30" />
        <View className="flex-1 items-center justify-center">
          <PlayerArtwork
            artwork={artwork}
            interstitial={interstitial}
            playing={playing}
            size={width - ARTWORK_INSET}
          />
        </View>
        <SongTitle song={song} interstitial={interstitial} />
        <Scrubber
          // A new song (or the ad) starts with a fresh scrubber.
          key={`${entryKey}-${interstitial}`}
          disabled={interstitial || song === null}
          fallbackDurationMs={interstitial ? 0 : (song?.durationMs ?? 0)}
        />
        <Transport />
        <PlayerOptions />
      </View>
    </View>
  );
}

function SongTitle({
  song,
  interstitial,
}: {
  song: SongListItem | null;
  interstitial: boolean;
}) {
  const title = interstitial ? "Premium Ad" : (song?.title ?? "Not Playing");
  const artist = interstitial ? "SYNQ" : song === null ? "" : artistLine(song);
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-title text-foreground font-semibold"
        >
          {title}
        </Text>
        <Text numberOfLines={1} className="text-title text-muted">
          {artist}
        </Text>
      </View>
      {song !== null && !interstitial && (
        <>
          <LikeButton songId={song.id} />
          {/* The song menu from the library screens goes here. */}
          <IconButton label="More" symbol="ellipsis" size={20} onPress={noop} />
        </>
      )}
    </View>
  );
}

function noop() {
  return undefined;
}
