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
import {
  ARTWORK_TOP,
  PLAYER_GAP_MIN,
  PLAYER_GAPS,
  playerArtworkSize,
} from "./player-layout";
import { Scrubber } from "./scrubber";
import { SongMenuButton } from "./song-menu-button";
import { isPlaying } from "./store";
import { artistLine } from "./tracks";
import { useCurrentSong } from "./use-player-songs";
import { VolumeSlider } from "./volume-slider";

/** One gap between the rows: a share of what the artwork and rows leave. */
function Gap({ share }: { share: number }) {
  return <View style={{ flex: share, minHeight: PLAYER_GAP_MIN }} />;
}

/**
 * The full player (a modal sheet; swipe down to close): the artwork at the top
 * over its own blurred backdrop, and the rest of the sheet spread among the
 * song, the timeline, and the controls, roughly half and half.
 */
export function PlayerScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const entryKey = usePlayer((state) => state.current?.key ?? null);
  const songId = usePlayer((state) => state.current?.songId ?? null);
  const playing = usePlayer((state) => isPlaying(state.status));
  const song = useCurrentSong(songId);
  const artwork = song?.artwork ?? null;
  return (
    <View className="flex-1">
      <PlayerBackdrop artwork={artwork} />
      <View className="flex-1 pt-3" style={{ paddingBottom: insets.bottom }}>
        <View className="h-1.5 w-10 self-center rounded-full bg-white/30" />
        <View className="items-center" style={{ marginTop: ARTWORK_TOP }}>
          <PlayerArtwork
            artwork={artwork}
            playing={playing}
            size={playerArtworkSize(width, height)}
          />
        </View>
        <View className="flex-1 px-8">
          <Gap share={PLAYER_GAPS.artworkToTitle} />
          <SongTitle song={song} entryKey={entryKey} />
          <Gap share={PLAYER_GAPS.titleToScrubber} />
          <Scrubber
            // A new song starts with a fresh scrubber.
            key={entryKey}
            disabled={song === null}
            fallbackDurationMs={song?.durationMs ?? 0}
          />
          <Gap share={PLAYER_GAPS.sliderToTransport} />
          <Transport />
          <Gap share={PLAYER_GAPS.sliderToTransport} />
          <VolumeSlider />
          <Gap share={PLAYER_GAPS.volumeToOptions} />
          <PlayerOptions />
          <Gap share={PLAYER_GAPS.optionsToBottom} />
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
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-0.5">
        <MarqueeText
          // A new song starts from the beginning of both lines.
          key={`title-${entryKey}`}
          text={title}
          active={focused}
          className="text-title-2 text-foreground font-semibold"
        />
        <MarqueeText
          key={`artist-${entryKey}`}
          text={artist}
          active={focused}
          className="text-body text-muted"
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
