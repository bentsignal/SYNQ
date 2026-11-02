import { View } from "react-native";

import type { SongListItem } from "@synq/db";
import { isSongLiked } from "@synq/db";

import { MenuButton } from "~/components/menu-button";
import { useLibraryQuery } from "~/features/library/queries";
import { songMenu } from "~/features/library/song-menu";
import { PLAYER_CIRCLE } from "./player-layout";

/** Larger than the circle it sits in, and overlapping nothing that takes touches. */
const TOUCH_WIDTH = 46;
const TOUCH_HEIGHT = 60;

/**
 * The player's `ellipsis` in the same circle as the heart: the same song menu
 * as a library row's. The button reaches past the circle, so the whole area
 * around the dots takes the touch.
 */
export function SongMenuButton({ song }: { song: SongListItem }) {
  const liked = useLibraryQuery({
    key: ["player", "liked", song.id],
    read: (db) => isSongLiked(db, song.id),
    select: (value) => value,
  });
  return (
    <View
      className="rounded-full bg-white/10"
      style={{ height: PLAYER_CIRCLE, width: PLAYER_CIRCLE }}
    >
      <MenuButton
        menu={songMenu(song, { liked })}
        width={TOUCH_WIDTH}
        height={TOUCH_HEIGHT}
        style={{
          left: (PLAYER_CIRCLE - TOUCH_WIDTH) / 2,
          position: "absolute",
          top: (PLAYER_CIRCLE - TOUCH_HEIGHT) / 2,
        }}
      />
    </View>
  );
}
