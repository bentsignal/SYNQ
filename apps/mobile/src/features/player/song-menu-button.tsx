import type { SongListItem } from "@synq/db";
import { isSongLiked } from "@synq/db";

import { MenuButton } from "~/components/menu-button";
import { useLibraryQuery } from "~/features/library/queries";
import { songMenu } from "~/features/library/song-menu";

/** The player's `ellipsis`: the same song menu as a library row's. */
export function SongMenuButton({ song }: { song: SongListItem }) {
  const liked = useLibraryQuery({
    key: ["player", "liked", song.id],
    read: (db) => isSongLiked(db, song.id),
    select: (value) => value,
  });
  return <MenuButton menu={songMenu(song, { liked })} size={44} />;
}
