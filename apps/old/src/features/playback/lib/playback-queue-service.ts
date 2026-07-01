import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import {
  getLibraryAlbumSongs,
  getLibraryArtistSongs,
  getLibraryPlaylistSongs,
} from "@/src/features/library/repository/library-song-repository";

type QueueSourceParams = {
  sourceType: SourceType;
  sourceId: number;
  sort?: SortType;
  order?: SortOrder;
  query?: string;
};

const getQueueSourceSongs = async ({
  sourceType,
  sourceId,
  sort,
  order,
  query,
}: QueueSourceParams): Promise<SongType[]> => {
  if (sourceType === SourceType.PLAYLIST) {
    return getLibraryPlaylistSongs({
      playlistId: sourceId,
      sort,
      order,
      query,
    });
  }

  if (sourceType === SourceType.ARTIST) {
    return getLibraryArtistSongs({
      artistId: sourceId,
      sort,
      order,
      query,
    });
  }

  if (sourceType === SourceType.ALBUM) {
    return getLibraryAlbumSongs({
      albumId: sourceId,
      sort,
      order,
      query,
    });
  }

  return [];
};

const getPaginationCap = (pagination: number, length: number) =>
  pagination > length ? length : pagination;

const pickShuffledSongs = (songs: SongType[], pagination: number) => {
  const next: SongType[] = [];
  const remainingSongs = [...songs];
  const cap = getPaginationCap(pagination, remainingSongs.length);

  for (let i = 0; i < cap; i++) {
    const randomIndex = Math.floor(Math.random() * remainingSongs.length);
    const newSong = remainingSongs[randomIndex];
    next.push(newSong);
    remainingSongs.splice(randomIndex, 1);
  }

  return next;
};

const pickSequentialSongs = (
  songs: SongType[],
  currentId: number,
  pagination: number,
) => {
  const currentIndex = songs.findIndex(
    (song: SongType) => song.id === currentId,
  );
  const validSongs = songs.filter(
    (song: SongType, index: number) => index > currentIndex,
  );
  const queuedSongs = validSongs.length === 0 ? songs : validSongs;
  const cap = getPaginationCap(pagination, queuedSongs.length);
  if (cap <= 0) return [];

  return queuedSongs.slice(0, cap);
};

const pickNextSongs = ({
  currentId,
  pagination,
  shuffle,
  songs,
}: {
  currentId: number;
  pagination: number;
  shuffle: boolean;
  songs: SongType[];
}) => {
  if (shuffle) {
    return pickShuffledSongs(songs, pagination);
  }

  return pickSequentialSongs(songs, currentId, pagination);
};

export const getNextUp = async (
  currentId: number,
  pagination: number = 100,
  shuffleValue: boolean,
  sourceTypeValue: SourceType,
  sourceIdValue: number,
  sort?: SortType,
  order?: SortOrder,
  query?: string,
): Promise<SongType[]> => {
  const songs = await getQueueSourceSongs({
    sourceType: sourceTypeValue,
    sourceId: sourceIdValue,
    sort,
    order,
    query,
  });

  try {
    return pickNextSongs({
      currentId,
      pagination,
      shuffle: shuffleValue,
      songs,
    });
  } catch (error) {
    console.log(error);
  }

  return [];
};
