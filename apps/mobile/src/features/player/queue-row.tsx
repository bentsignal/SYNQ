import { Text, View } from "react-native";

import type { SongListItem } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { SymbolIcon } from "~/components/symbol-icon";
import { artistLine } from "./tracks";

/** Every queue row's height: the list places rows by it, on the UI thread. */
export const QUEUE_ROW_HEIGHT = 60;
const ARTWORK = 44;

/**
 * What a queue row shows: artwork, title, artist, and (in Up Next) the drag
 * handle. A drag starts on the handle's side of the row (`queue-list.tsx`);
 * the symbol only shows where.
 */
export function QueueRow({
  song,
  handle = false,
}: {
  song: SongListItem;
  handle?: boolean;
}) {
  return (
    <View
      className="flex-row items-center gap-3 pl-4"
      style={{ height: QUEUE_ROW_HEIGHT }}
    >
      <Artwork artwork={song.artwork} placeholder="song" size={ARTWORK} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-body text-foreground">
          {song.title}
        </Text>
        <Text numberOfLines={1} className="text-subhead text-muted">
          {artistLine(song)}
        </Text>
      </View>
      {handle ? (
        <View className="w-14 items-center">
          <SymbolIcon
            name="line.3.horizontal"
            size={20}
            tintColorClassName="accent-muted"
          />
        </View>
      ) : (
        <View className="w-1" />
      )}
    </View>
  );
}
