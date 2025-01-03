import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { SongType, InfoType, PageType, TagsType, SourceType, SongResultType, SortType, ArtistType } from '@/constants/Types'
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import SongModel from '@/lib/models/SongModel';
import 'react-native-get-random-values';
import { splitImageMimeAndBuffer, getCoverImageData } from '@/lib/controllers/ImageController';

export const updateMetadata = async (song: SongType) => {

  if ([PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(song.pageType)) {
    // retrieve data if song is from library
    try {
      const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.name}`;
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
      const image = await getCoverImageData(song.id, true);
      if (image && song.info && song.info.metadata) {
        song.info.metadata.artwork = image;
      }
    }
    catch (error) {
      console.log('error reading image file data: ', error);
    }
  }

  // validate data
  if (!song.data) {
    console.log('Import song with no data, return');
    return;
  }

  const NodeID3 = require('@/lib/node-id3');

  let tags: TagsType = {};

  tags.title = song.info.metadata?.name ?? '';
  tags.artist = song.info.metadata?.artist ?? '';
  tags.album = song.info.metadata?.album ?? '';
  const image = song.info.metadata?.artwork ?? '';
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
    }
  }
  else {
    console.log('no image for library song export');
  }

  try {
    if (['audio/mpeg', 'audio/flac'].includes(song.info.fileType ?? '')) {
      song.data = fromByteArray(NodeID3.writeExpo(toByteArray(song.data), tags));
    }
  }
  catch (error) {
    console.log('error modiying audio file data', error);
  }

  if (song.pageType === PageType.LIBRARY) {
    if (song.info.metadata && song.info.metadata.artwork) {
      song.info.metadata.artwork = '';
    }
  }

}

export const removeSongs = (
  results: [SongType],
  ids: string[]
) => {
  let newResults = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && !ids.includes(results[i].id)) {
      newResults.push(results[i]);
    }
  }
  return newResults;
}

export const saveEdits = (

  results: SongType[],
  ids: string[],
  title: string,
  artist: string,
  album: string,
  artwork: string

) => {

  // update each song in results 
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && ids.includes(results[i].id)) {
      results[i].edited = true;
      const metadata = results[i].info?.metadata;
      let newTitle = title ? title : results[i].info.metadata?.name;
      let newArtist = artist ? artist : results[i].info.metadata?.artist;
      let newAlbum = album ? album : results[i].info.metadata?.album;
      let newArtwork = artwork ? artwork : results[i].info.metadata?.artwork;
      results[i].info.metadata = {
        name: newTitle,
        artist: newArtist,
        album: newAlbum,
        artwork: newArtwork
      };
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
      name: result.fileName,
      id: result.id,
      data: '',
      edited: result.edited ? true : false,
      info: {
        fileType: result.fileType,
        format: 'id3v2.4',
        name: result.name,
        metadata: {
          album: result.album,
          artist: result.artists,
          artwork: '',
          name: result.title,
        }
      }
    };
  }
  catch (error) {
    return {
      name: '',
      id: '-1',
      data: '',
      edited: false,
      info: {}
    };
  }
}

export const generateSongKey = (song: SongType) => {
  if (song) {
    const name = song.info.metadata?.name ?? 'no-name';
    const artist = song.info.metadata?.artist ?? 'no-artist';
    const album = song.info.metadata?.album ?? 'no-album';
    const uuid = song.uuid ?? 'no-uuid';
    let cover = 'no-cover';
    try {
      cover = song.info.metadata?.artwork ? song.info.metadata.artwork.substring(0, 300) : 'no-cover';
    }
    catch (error) {
      cover = 'no-cover';
    }
    return `${song.id}-${uuid}-${name}-${artist}-${album}-${cover}`;
  }
  return '-1';
}