import { PageType, SongType } from "@/src/constants/Types";
import songBus from "@/src/events/song/Bus";
import { SongBusEvent } from "@/src/events/song/Events";
import PlaylistModel from "@/src/models/PlaylistModel";
import SongModel from "@/src/models/SongModel";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import {
  addAlbumToSong,
  addArtistToAlbum,
  getAlbumsFromSong,
  getSongsFromAlbum,
} from "@/src/controllers/AlbumController";
import { addArtistToSong } from "@/src/controllers/ArtistController";
import {
  deleteImagesFromDirectory,
  writeImageToLibrary,
} from "@/src/controllers/ImageController";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import albumBus from "@/src/events/album/Bus";
import { AlbumBusEvent } from "@/src/events/album/Events";
import { eq } from "drizzle-orm";
import { flagSongAsEdited } from "./SongController";

export const updateSongsInLibrary = async (
  ids: number[],
  title: string,
  artist: string,
  album: string,
  cover: string,
) => {
  const db = SongModel.getInstance();
  for (let i = 0; i < ids.length; i++) {
    const dir = `${FileSystem.documentDirectory}library/${ids[i]}`;
    if (cover) {
      // if song has album, write to album dir
      const albums = await getAlbumsFromSong(ids[i]);
      if (albums.length > 0) {
        const album = albums[0];
        const albumDir = `${FileSystem.documentDirectory}albums/${album.id}`;
        await writeImageToLibrary(cover, albumDir);
        await flagSongAsEdited(ids[i]);
        const albumSongs = await getSongsFromAlbum(album.id);
        albumSongs.forEach((song) => {
          if (song.id !== ids[i]) {
            flagSongAsEdited(song.id);
          }
        });
        albumBus.emit(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, {
          id: album.id,
        });
      }
      // if song doesn't have album, write to song dir
      else {
        await deleteImagesFromDirectory(dir);
        await writeImageToLibrary(cover, dir);
        await flagSongAsEdited(ids[i]);
        songBus.emit(SongBusEvent.SONG_COVER_MODIFIED, {
          id: ids[i],
          type: PageType.LIBRARY,
        });
      }
    }
    if (title || artist || album) {
      await db.editSong(ids[i], title, artist, album);
      songBus.emit(SongBusEvent.SONG_INFO_MODIFIED, {
        id: ids[i],
        type: PageType.LIBRARY,
        title: title,
        artist: artist,
        album: album,
      });
    }
  }
};

export const saveToLibrary = async (
  songs: SongType[],
  progress: (value: number) => void,
) => {
  try {
    const db = SongModel.getInstance();
    const playlistDb = PlaylistModel.getInstance();
    for (let i = 0; i < songs.length; i++) {
      try {
        const song = songs[i];
        const title = song.title ?? "";
        const artists = song.artist ?? "";
        const album = song.album ?? "";
        const artwork = song.artwork ?? "";
        const fileType = song.fileType ?? "";
        const edited = song.edited ? true : false;
        const duration = song.duration ?? 0;
        let fileName = song.fileName ?? "";
        if (fileName === "" && fileType !== "") {
          fileName = `song.${fileType}`;
        }
        const genre = "Music";
        // insert song into database
        const id = await db.insertSong(
          title,
          artists,
          album,
          genre,
          duration,
          fileType,
          fileName,
          edited,
        );
        if (id !== -1) {
          // create directory and write song data if successfully inserted into DB
          await createLibraryDir();
          const dir = `${FileSystem.documentDirectory}library/${id}`;
          try {
            await FileSystem.makeDirectoryAsync(dir);
            await FileSystem.copyAsync({
              from: song.cacheUri,
              to: `${dir}/${song.fileName}`,
            });
            await FileSystem.deleteAsync(song.cacheUri);
          } catch (error) {
            console.log("error writing audio: ", error);
            // TODO: delete song from DB
            continue;
          }
          if (song.importAlbums && song.importAlbums.length > 0) {
            for (let j = 0; j < song.importAlbums.length; j++) {
              await addAlbumToSong(song.importAlbums[j].id, id, song.track);
              // add artists to album if they aren't already on it
              if (song.importArtists && song.importArtists.length > 0) {
                for (let k = 0; k < song.importArtists.length; k++) {
                  await addArtistToAlbum(
                    song.importArtists[k].id,
                    song.importAlbums[j].id,
                  );
                }
              }
              // create album directory if it doesn't exist
              const albumDir = `${FileSystem.documentDirectory}albums/${song.importAlbums[j].id}`;
              const info = await FileSystem.getInfoAsync(albumDir);
              if (!info.exists) {
                await FileSystem.makeDirectoryAsync(albumDir);
              }
              // write album cover to directory if it doesn't exist
              const files = await FileSystem.readDirectoryAsync(albumDir);
              if (
                !files.includes("cover_small.jpg") &&
                !files.includes("cover_full.jpg")
              ) {
                await writeImageToLibrary(song.importAlbums[j].image, albumDir);
              }
            }
          } else {
            await writeImageToLibrary(artwork, dir);
          }
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
      } catch (error) {
        console.error("Error inserting song: ", error);
        progress(i + 1);
      }
    }
  } catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    throw new Error("Error saving to library: " + trace);
  }
};

export const deleteFromLibrary = async (id: number) => {
  try {
    const removed = await db
      .delete(schema.songs)
      .where(eq(schema.songs.id, id));
    if (removed) {
      await FileSystem.deleteAsync(
        `${FileSystem.documentDirectory}library/${id}`,
      );
    }
    return removed;
  } catch (error) {
    console.log("error deleting from library: ", error);
  }
};

const createLibraryDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}library`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already exists")) {
      console.log("error creating library directory: ", error);
    }
  }
};
