import { Text, View } from "react-native";

import type { SongListItem } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { SymbolIcon } from "~/components/symbol-icon";
import { artistLine } from "./tracks";

/** Every queue row's height: the list places rows by it, on the UI thread. */
export const QUEUE_ROW_HEIGHT = 60;
export const QUEUE_HANDLE_WIDTH = 56;
const ARTWORK = 44;

/**
 * What a queue row shows: artwork, title, artist.
 */
export function QueueRow({ song }: { song: SongListItem }) {
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
    </View>
  );
}

/**
 * The drag handle beside an Up Next row. It only shows where a drag starts
 * (`queue-list.tsx` handles the touch), and it sits outside the row's press
 * so a tap on it can't play the song.
 */
export function QueueHandle() {
  return (
    <View
      className="items-center justify-center"
      style={{ width: QUEUE_HANDLE_WIDTH }}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      <SymbolIcon
        name="line.3.horizontal"
        size={20}
        tintColorClassName="accent-muted"
      />
    </View>
  );
}
