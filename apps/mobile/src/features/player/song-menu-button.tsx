import type { SongListItem } from "@synq/db";
import { isSongLiked } from "@synq/db";

import { MenuButton } from "~/components/menu-button";
import { useLibraryQuery } from "~/features/library/queries";
import { songMenu } from "~/features/library/song-menu";
import { PLAYER_CIRCLE } from "./player-layout";

const CIRCLE_COLOR = "rgba(255, 255, 255, 0.1)";
/** How far past the circle touches still count, without reaching the heart. */
const TOUCH_OUTSET = { horizontal: 6, vertical: 13 };

/**
 * The player's `ellipsis` in the same circle as the heart: the same song menu
 * as a library row's. The circle is the button, so all of it turns into the
 * menu, and touches around it count too.
 */
export function SongMenuButton({ song }: { song: SongListItem }) {
  const liked = useLibraryQuery({
    key: ["player", "liked", song.id],
    read: (db) => isSongLiked(db, song.id),
    select: (value) => value,
  });
  return (
    <MenuButton
      menu={songMenu(song, { liked })}
      width={PLAYER_CIRCLE}
      height={PLAYER_CIRCLE}
      circleColor={CIRCLE_COLOR}
      touchOutset={TOUCH_OUTSET}
    />
  );
}
