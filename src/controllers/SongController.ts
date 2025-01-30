import * as FileSystem from 'expo-file-system'
import { SongType, PageType, TagsType, InfoType } from '@/src/constants/Types'
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import SongModel from '@/src/models/SongModel';
import 'react-native-get-random-values';
import { splitImageMimeAndBuffer, getSongCover } from '@/src/controllers/ImageController';
import { getAlbumCover, getAlbumCoverFromSong } from './AlbumController';
import { check } from '@/lib/Util';
import { getAudioMetadata } from '@missingcore/audio-metadata';

export const updateMetadata = async (song: SongType) => {

  if (song.pageType !== PageType.IMPORT) {
    // retrieve data if song is from library
    try {
      const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
      const data = await FileSystem.readAsStringAsync(audioPath, { encoding: 'base64' });
      if (data) {
        song.data = data;
      }
    }
    catch (error) {
      console.log('error reading audio file data: ', error);
    }
    try {
      // retrieve image if it exists
      const path = await getAbsoluteSongCover(song.id, true);
      const image = await FileSystem.readAsStringAsync(path, { encoding: 'base64' });
      song.artwork = image ? image : song.artwork;
    }
    catch (error) {
      console.log('error reading image file data: ', error);
    }
  }
  else if (song.pageType === PageType.IMPORT) {
    if (song.importAlbums && song.importAlbums.length > 0) {
      const path = await getAlbumCover(song.importAlbums[0].id);
      if (path) {
        const image = await FileSystem.readAsStringAsync(path, { encoding: 'base64' });
        song.artwork = image ? image : song.artwork;
      }
    }
    song.data = await FileSystem.readAsStringAsync(song.cacheUri, { encoding: 'base64' });
  }
  else {
    return null;
  }

  // validate data
  if (!song.data) {
    console.log('Import song with no data, return');
    return;
  }

  const NodeID3 = require('@/lib/node-id3');

  let tags: TagsType = {};

  tags.title = song.title ?? '';
  tags.artist = song.artist ?? '';
  tags.album = song.album ?? '';
  const image = song.artwork ?? '';
  if (image) {
    if ([PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(song.pageType)) {
      tags.APIC = {
        description: 'Album Cover',
        imageBuffer: image,
        mime: 'image/jpeg',
      };
    }
    else if (song.pageType === PageType.IMPORT) {
      const { mime, buffer } = splitImageMimeAndBuffer(image);
      if (mime && buffer) {
        tags.APIC = {
          description: 'Album Cover',
          imageBuffer: buffer,
          mime: mime,
        };
      }
      else {
        tags.APIC = {
          description: 'Album Cover',
          imageBuffer: image,
          mime: 'image/jpeg',
        };
      }
    }
  }
  else {
    console.log('no image for library song export');
  }

  try {
    if (['audio/mpeg', 'audio/flac'].includes(song.fileType)) {
      song.data = fromByteArray(NodeID3.writeExpo(toByteArray(song.data), tags));
      if (song.pageType === PageType.IMPORT) {
        await FileSystem.writeAsStringAsync(song.cacheUri, song.data, { encoding: 'base64' });
      }
      else {
        const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
        await FileSystem.writeAsStringAsync(audioPath, song.data, { encoding: 'base64' });
      }
    }
    else {
      console.log('no file type for song: ', song.title, song.fileType);
    }
  }
  catch (error) {
    console.log('error modiying audio file data', error);
  }

}

export const removeSongs = async (
  results: [SongType],
  ids: number[]
) => {
  let newResults = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].id) {
      if (!ids.includes(results[i].id)) {
        newResults.push(results[i]);
      }
      else if (results[i].cacheUri) {
        try {
          await FileSystem.deleteAsync(results[i].cacheUri);
        }
        catch (error) {
          console.log('error deleting cached song file: ', error);
        }
      }
    }
  }
  return newResults;
}

export const saveEdits = (

  results: SongType[],
  ids: number[],
  title: string,
  artist: string,
  album: string,
  artwork: string

) => {

  // update each song in results 
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && ids.includes(results[i].id)) {
      results[i].edited = true;
      results[i].title = title ? title : results[i].title;
      results[i].artist = artist ? artist : results[i].artist;
      results[i].album = album ? album : results[i].album;
      results[i].artwork = artwork ? artwork : results[i].artwork;
    }
  }

  return results;

}

export const getSongById = async (id: number) => {
  try {
    const db = SongModel.getInstance();
    const result = await db.getSongById(id);
    return getSongByResult(result);
  }
  catch (error) {
    throw new Error('Error getting song by id: ' + error);
  }
}

export const getSongByResult = (result: any): SongType => {
  try {
    return {
      fileName: result.fileName,
      id: result.id,
      edited: result.edited ? true : false,
      fileType: result.fileType,
      format: 'id3v2.4',
      title: result.title,
      album: result.album,
      artist: result.artists,
    };
  }
  catch (error) {
    return {
      id: -1,
      edited: false
    };
  }
}

export const generateSongKey = (song: SongType) => {
  if (song) {
    const name = song.title ?? 'no-name';
    const artist = song.artist ?? 'no-artist';
    const album = song.album ?? 'no-album';
    const uuid = song.uuid ?? 'no-uuid';
    let cover = 'no-cover';
    try {
      cover = song.artwork ? song.artwork.substring(0, 300) : 'no-cover';
    }
    catch (error) {
      cover = 'no-cover';
    }
    return `${song.id}-${uuid}-${name}-${artist}-${album}-${cover}`;
  }
  return '-1';
}

export const getAbsoluteSongCover = async (id: number, full: boolean = false) => {
  const albumCover = await getAlbumCoverFromSong(id, full);
  if (albumCover) {
    return albumCover;
  }
  else {
    const cover = await getSongCover(id, full);
    if (cover) {
      return cover;
    }
  }
}

export const flagSongAsEdited = async (id: number) => {
  return await SongModel.getInstance().flagSongAsEdited(id);
}

const checkField = (oldValue: string, newValue: string) => {
  if (!oldValue && !newValue) {
    return false;
  }
  else if (oldValue !== newValue) {
    return true;
  }
  return false;
}

export const isSongEdited = async (song: SongType) => {

  if (!check(song)) {
    return null;
  }

  if (song.edited === true) {
    return true;
  }

  let url;
  if (song.pageType !== PageType.IMPORT) {
    url = `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
  }
  else if (song.cacheUri) {
    url = song.cacheUri;
  }
  else {
    return null;
  }

  try {
    const wantedTags = ['name', 'artist', 'album'] as const;
    const info: InfoType = await getAudioMetadata(url, wantedTags);
    if (checkField(info.metadata?.name, song.title)) {
      return true;
    }
    else if (checkField(info.metadata?.artist, song.artist)) {
      return true;
    }
    else if (checkField(info.metadata?.album, song.album)) {
      return true;
    }
    else {
      return false;
    }
  }
  catch (error) {
    return false;
  }

}
