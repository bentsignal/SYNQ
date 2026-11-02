import type { SongListItem } from "@synq/db";
import { isSongLiked } from "@synq/db";

import { MenuButton } from "~/components/menu-button";
import { useLibraryQuery } from "~/features/library/queries";
import { songMenu } from "~/features/library/song-menu";

/**
 * How far the button reaches past the dots, on the right and in the margin
 * beyond them. The dots' right edge is the scrubber's right end.
 */
const REACH = 15;
/** Taller than the title row, without taking any more of its height. */
const HEIGHT = 64;
const WIDTH = 52;
const TITLE_ROW = 48;
/** The clear space the `ellipsis` symbol has on its right, at this size. */
const SYMBOL_BEARING = 3;

/** The player's `ellipsis`: the same song menu as a library row's. */
export function SongMenuButton({ song }: { song: SongListItem }) {
  const liked = useLibraryQuery({
    key: ["player", "liked", song.id],
    read: (db) => isSongLiked(db, song.id),
    select: (value) => value,
  });
  return (
    <MenuButton
      menu={songMenu(song, { liked })}
      width={WIDTH}
      height={HEIGHT}
      trailingInset={REACH - SYMBOL_BEARING}
      style={{
        marginRight: -REACH,
        marginVertical: (TITLE_ROW - HEIGHT) / 2,
      }}
    />
  );
}
