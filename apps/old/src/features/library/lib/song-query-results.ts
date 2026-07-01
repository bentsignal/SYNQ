import {
  PageType,
  SortOrder,
  SortType,
  type SongType,
} from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/features/images/repository/image-repository";

type SongQueryField = "title" | "artist" | "album";
type SongSortComparers = Partial<Record<SortType, SongSortComparer>>;
type SongSortComparer = (first: SongType, second: SongType) => number;
type SongQueryResult = SongType & {
  artistNames: Set<string>;
  albumNames: Set<string>;
  albumCoverImage?: string | null;
};

type SongQueryResultRow = {
  song: {
    id: number;
    originalFileName: string | null;
    fileType: string | null;
    title: string | null;
    duration: number | null;
    coverImage: string | null;
  };
  artistName: string | null;
  albumName: string | null;
  albumCoverImage: string | null;
  track?: number | null;
};

type SortSongResultsInput = {
  comparers: SongSortComparers;
  fallbackComparer: SongSortComparer;
  order: SortOrder;
  songs: SongType[];
  sort: SortType;
};

type RowsToSongResultsInput<Row extends SongQueryResultRow> = {
  pageType: PageType;
  rows: Row[];
};

type SongResultSummary = {
  totalDuration: number;
  totalSongCount: number;
};

export const normalizeLibraryQuery = (query?: string) =>
  query?.trim().toLowerCase() ?? "";

export const compareLibraryText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

export const compareOptionalTrack = (first?: number, second?: number) => {
  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return first - second;
};

export const matchesSongQuery = (
  song: SongType,
  query: string,
  fields: SongQueryField[] = ["title", "artist", "album"],
) => {
  if (!query) {
    return true;
  }

  return fields.some((field) => song[field]?.toLowerCase().includes(query));
};

export const sortSongResults = ({
  comparers,
  fallbackComparer,
  order,
  songs,
  sort,
}: SortSongResultsInput) => {
  const comparer = comparers[sort] ?? fallbackComparer;
  const sorted = [...songs].sort(comparer);

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

export const getSongResultSummary = (songs: SongType[]): SongResultSummary => {
  return {
    totalSongCount: songs.length,
    totalDuration: songs.reduce((acc, song) => acc + (song.duration ?? 0), 0),
  };
};

export const rowsToSongResults = <Row extends SongQueryResultRow>({
  pageType,
  rows,
}: RowsToSongResultsInput<Row>) => {
  const songMap = new Map<number, SongQueryResult>();

  rows.forEach(({ song, track, artistName, albumName, albumCoverImage }) => {
    const current =
      songMap.get(song.id) ??
      ({
        id: song.id,
        edited: false,
        fileName: song.originalFileName ?? undefined,
        fileType: song.fileType ?? undefined,
        format: "id3v2.4",
        title: song.title ?? undefined,
        duration: song.duration ?? undefined,
        track: track ?? undefined,
        artwork: song.coverImage
          ? getImagePathFromHash(song.coverImage).pathToFullImage
          : undefined,
        pageType,
        artistNames: new Set<string>(),
        albumNames: new Set<string>(),
        albumCoverImage: undefined,
      } satisfies SongQueryResult);

    if (artistName) {
      current.artistNames.add(artistName);
    }

    if (albumName) {
      current.albumNames.add(albumName);
    }

    current.albumCoverImage = current.albumCoverImage ?? albumCoverImage;

    songMap.set(song.id, current);
  });

  return Array.from(songMap.values()).map((song) => {
    const { artistNames, albumNames, albumCoverImage, ...result } = song;
    return {
      ...result,
      artist: Array.from(artistNames).join(", "),
      album: Array.from(albumNames).join(", "),
      artwork: albumCoverImage
        ? getImagePathFromHash(albumCoverImage).pathToFullImage
        : result.artwork,
    };
  });
};
