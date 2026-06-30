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
  const next: SongType[] = [];
  let songs: SongType[] = [];
  if (sourceTypeValue === SourceType.PLAYLIST) {
    songs = await getLibraryPlaylistSongs({
      playlistId: sourceIdValue,
      sort,
      order,
      query,
    });
  } else if (sourceTypeValue === SourceType.ARTIST) {
    songs = await getLibraryArtistSongs({
      artistId: sourceIdValue,
      sort,
      order,
      query,
    });
  } else if (sourceTypeValue === SourceType.ALBUM) {
    songs = await getLibraryAlbumSongs({
      albumId: sourceIdValue,
      sort,
      order,
      query,
    });
  } else {
    return songs;
  }

  try {
    if (shuffleValue) {
      const cap = pagination > songs.length ? songs.length : pagination;
      for (let i = 0; i < cap; i++) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        const newSong = songs[randomIndex];
        next.push(newSong);
        songs.splice(randomIndex, 1);
      }
    } else {
      const currentIndex = songs.findIndex(
        (song: SongType) => song.id === currentId,
      );
      const validSongs = songs.filter(
        (song: SongType, index: number) => index > currentIndex,
      );
      if (validSongs.length === 0) {
        const cap = pagination > songs.length ? songs.length : pagination;
        for (let i = 0; i < cap; i++) {
          const newSong = songs[i];
          next.push(newSong);
        }
      } else {
        const cap =
          pagination > validSongs.length ? validSongs.length : pagination;
        for (let i = 0; i < cap; i++) {
          const newSong = validSongs[i];
          next.push(newSong);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return next;
};
