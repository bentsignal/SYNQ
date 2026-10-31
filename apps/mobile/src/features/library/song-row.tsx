import { Text, View } from "react-native";

import type { SongListItem } from "@synq/db";
import { listLikedSongIds } from "@synq/db";

import type { SongMenuPlace } from "./song-menu";
import { Artwork } from "~/components/artwork";
import { NativeRow } from "~/components/native-row";
import { SymbolIcon } from "~/components/symbol-icon";
import { useNowPlaying } from "~/features/player/now-playing";
import { cn } from "~/lib/cn";
import { dotted, names, UNKNOWN_ARTIST } from "./format";
import { useLibraryQuery } from "./queries";
import { songMenu } from "./song-menu";

/** Every song row's height, so lists can lay rows out before measuring. */
export const SONG_ROW_HEIGHT = 64;

const ARTWORK_SIZE = 48;
/** The track number column on album pages, in place of artwork. */
const TRACK_WIDTH = 28;
const LEADING = 16;
const GAP = 12;

/** Whether the song is in Liked Songs (one shared read for every row). */
function useIsLiked(songId: number) {
  return useLibraryQuery({
    key: ["liked-ids"],
    read: listLikedSongIds,
    select: (ids) => ids.includes(songId),
  });
}

/** `artist · album` under a song's title. */
export function songDetail(song: SongListItem) {
  return dotted(names(song.artists) || UNKNOWN_ARTIST, song.albums[0]?.name);
}

/** The animated `waveform` beside the playing song (still while paused). */
function PlayingMark({ playing }: { playing: boolean }) {
  return (
    <SymbolIcon
      name="waveform"
      size={14}
      tintColorClassName="accent-accent"
      animationSpec={
        playing
          ? {
              repeating: true,
              variableAnimationSpec: { iterative: true, reversing: true },
            }
          : undefined
      }
    />
  );
}

function Leading({
  song,
  track,
  current,
  playing,
}: {
  song: SongListItem;
  track: number | null | undefined;
  current: boolean;
  playing: boolean;
}) {
  if (track === undefined) {
    return (
      <Artwork artwork={song.artwork} placeholder="song" size={ARTWORK_SIZE} />
    );
  }
  return (
    <View className="items-center" style={{ width: TRACK_WIDTH }}>
      {current ? (
        <PlayingMark playing={playing} />
      ) : (
        <Text className="text-body text-muted tabular-nums">{track ?? ""}</Text>
      )}
    </View>
  );
}

/**
 * A song in a list (docs/ui.md → Song row): artwork, title over
 * `artist · album`, and the song menu on the trailing ellipsis and on a
 * long press. The playing song's title is in the accent beside an animated
 * waveform. On album pages, `track` puts the track number where the
 * artwork goes and `subtitle` says only what differs from the album.
 */
export function SongRow({
  song,
  place,
  onPress,
  track,
  subtitle,
}: {
  song: SongListItem;
  /** Where the row is (`liked` is looked up here). */
  place?: Omit<SongMenuPlace, "liked">;
  onPress: () => void;
  /** Album pages: the track number (null when the song has none). */
  track?: number | null;
  /** Replaces `artist · album` under the title; null hides the line. */
  subtitle?: string | null;
}) {
  const liked = useIsLiked(song.id);
  const nowPlaying = useNowPlaying();
  const current = nowPlaying.songId === song.id;
  const detail = subtitle === undefined ? songDetail(song) : subtitle;
  const textInset =
    LEADING + (track === undefined ? ARTWORK_SIZE : TRACK_WIDTH) + GAP;
  return (
    <NativeRow
      height={SONG_ROW_HEIGHT}
      label={detail === null ? song.title : `${song.title}, ${detail}`}
      menu={songMenu(song, { ...place, liked })}
      separatorInset={textInset}
      onPress={onPress}
    >
      <View style={{ width: LEADING }} />
      <Leading
        song={song}
        track={track}
        current={current}
        playing={nowPlaying.playing}
      />
      <View className="flex-1 justify-center" style={{ marginLeft: GAP }}>
        <View className="flex-row items-center gap-1.5">
          {current && track === undefined && (
            <PlayingMark playing={nowPlaying.playing} />
          )}
          <Text
            numberOfLines={1}
            className={cn(
              "text-body flex-shrink",
              current ? "text-accent" : "text-foreground",
            )}
          >
            {song.title}
          </Text>
        </View>
        {detail !== null && detail !== "" && (
          <Text numberOfLines={1} className="text-subhead text-muted">
            {detail}
          </Text>
        )}
      </View>
    </NativeRow>
  );
}
