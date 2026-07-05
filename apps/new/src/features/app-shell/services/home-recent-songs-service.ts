import { formatDurationMs } from "./duration-format-service";
import type { LibrarySongPreview } from "../../library/services/library-song-preview-service";
import type { HomeHref } from "./home-action-service";

export const getHomeLibraryHref = (): HomeHref => "/(tabs)/library";

export const getHomeRecentSongHref = ({
  songId,
}: {
  songId: number;
}): HomeHref => `/(tabs)/library/song/${songId}`;

export const getHomeRecentSongsSectionState = ({
  hasLibrary,
  songs,
}: {
  hasLibrary: boolean;
  songs: LibrarySongPreview[];
}) => ({
  emptyState: {
    body: "Import audio files to see recent songs here.",
    title: "Build your library",
  },
  libraryHref: getHomeLibraryHref(),
  rows:
    hasLibrary && songs.length > 0
      ? songs.map((song) => ({
          detailLabel: `${song.artist} - ${song.album}`,
          durationLabel: formatDurationMs(song.duration),
          href: getHomeRecentSongHref({ songId: song.id }),
          song,
        }))
      : [],
  title: "Recent Songs",
});

export type HomeRecentSongsSectionState = ReturnType<
  typeof getHomeRecentSongsSectionState
>;
