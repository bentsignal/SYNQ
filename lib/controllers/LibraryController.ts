import * as FileSystem from 'expo-file-system'
import { SongType, PageType } from '@/constants/Types'
import SongDataManager from '@/lib/data/SongDataManager';
import PlaylistDataManager from '@/lib/data/PlaylistDataManager';
import songBus from "@/station/song/Bus";
import { SongBusEvent } from "@/station/song/Events";
import 'react-native-get-random-values';
import { addArtistToSong } from '@/lib/controllers/ArtistController';
import { writeImageToLibrary, deleteImagesFromDirectory } from '@/lib/controllers/ImageController';

export const updateSongsInLibrary = async (
  ids: string[],
  title: string,
  artist: string,
  album: string,
  cover: string,
) => {
  const db = SongDataManager.getInstance();
  for (let i = 0; i < ids.length; i++) {
    const dir = `${FileSystem.documentDirectory}library/${ids[i]}`;
    if (cover) {
      await deleteImagesFromDirectory(dir);
      await writeImageToLibrary(cover, dir);
      songBus.emit(SongBusEvent.SONG_COVER_MODIFIED, {
        id: ids[i],
        type: PageType.LIBRARY,
      });
    }
    if (title || artist || album) {
      await db.editSong(Number(ids[i]), title, artist, album);
      songBus.emit(SongBusEvent.SONG_INFO_MODIFIED, {
        id: ids[i],
        type: PageType.LIBRARY,
        title: title,
        artist: artist,
        album: album,
      });
    }
  }
}

export const saveToLibrary = async (
  songs: SongType[],
  progress: (value: number) => void,
) => {
  try {
    const db = SongDataManager.getInstance();
    const playlistDb = PlaylistDataManager.getInstance();
    for (let i = 0; i < songs.length; i++) {
      try {
        const song = songs[i];
        const title = song.info.metadata?.name ? song.info.metadata.name : '';
        const artists = song.info.metadata?.artist ? song.info.metadata.artist : '';
        const album = song.info.metadata?.album ? song.info.metadata.album : '';
        const artwork = song.info.metadata?.artwork ? song.info.metadata.artwork : '';
        const fileType = song.info.fileType ? song.info.fileType : '';
        const edited = song.edited ? true : false;
        let fileName = song.name ? song.name : '';
        if (fileName === '' && fileType !== '') {
          fileName = `song.${fileType}`;
        }
        const genre = 'Music';
        const duration = 0;
        // insert song into database
        const id = await db.insertSong(title, artists, album, genre, duration, fileType, fileName, edited);
        if (id !== -1) {
          // create directory and write song data if successfully inserted into DB
          await createLibraryDir();
          const dir = `${FileSystem.documentDirectory}library/${id}`;
          try {
            await FileSystem.makeDirectoryAsync(dir);
            await FileSystem.writeAsStringAsync(`${dir}/${fileName}`, song.data, { encoding: 'base64' });
          }
          catch (error) {
            console.log('error writing audio: ', error);
            // TODO: delete song from DB
            continue;
          }
          await writeImageToLibrary(artwork, dir);
          // add song to library playlist
          await playlistDb.addToPlaylist(1, id);
          // add song to artist
          if (song.importArtists && song.importArtists.length > 0) {
            for (let j = 0; j < song.importArtists.length; j++) {
              await addArtistToSong(song.importArtists[j].id, id);
            }
          }
        }
        progress(i + 1);
      }
      catch (error) {
        console.error('Error inserting song: ', error);
        progress(i + 1);
      }
    }
  }
  catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    throw new Error('Error saving to library: ' + trace);
  }
};

export const deleteFromLibrary = async (id: number) => {
  try {
    const db = SongDataManager.getInstance();
    const removed = await db.removeSong(id);
    if (removed) {
      await FileSystem.deleteAsync(`${FileSystem.documentDirectory}library/${id}`);
    }
    return removed;
  }
  catch (error) {
    console.log('error deleting from library: ', error);
  }
}

const createLibraryDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}library`);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('already exists')) {
      console.log('error creating library directory: ', error);
    }
  }
}