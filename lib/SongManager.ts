import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { SongType } from '@/constants/Types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker';
import { toByteArray, fromByteArray } from 'react-native-quick-base64'

const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
}

export const getCompletion = (size: number, progress: number) => {
  try {
    if (size === 0) {
      return 0;
    }
    let result = ((1 - ((progress - 1) / size)) * 100);
    if (result < 0) {
      return 0;
    }
    else if (result > 100) {
      return 100;
    }
    else {
      return result;
    }
  }
  catch (error) {
    console.error('Error getting completion percentage:', error);
    return 0;
  }
}

const getExportNumber = async () => {
  try {
    const numberString = await AsyncStorage.getItem('exportNumber');
    if (numberString && isValidNumString(numberString)) {
      let number = Number(numberString);
      number++;
      await AsyncStorage.setItem('exportNumber', number.toString());
      return number;
    }
    else {
      throw new Error('Bad data');
    }
  }
  catch (error) {
    await AsyncStorage.setItem('exportNumber', '1');
    return 1;
  }
}

export const exportSongs = async (songs: any) => {

  const date = new Date();
  const exportNumber = await getExportNumber();
  const dir = `${FileSystem.documentDirectory}batch ${exportNumber}  -  ${date.getMonth()}.${date.getDate()}.${date.getFullYear()}`;
  let destination;
  
  await FileSystem.makeDirectoryAsync(dir);
  
  if (songs.length === 1) {
    destination = `${dir}/${songs[0].name}`;
    await FileSystem.writeAsStringAsync(destination, songs[0].data, {encoding: 'base64'});
    await Sharing.shareAsync(destination);
  }
  else if (songs.length > 1) {
    for (let i = 0; i < songs.length; i++) {
      destination = `${dir}/${songs[i].name}`;
      await FileSystem.writeAsStringAsync(destination, songs[i].data, {encoding: 'base64'});
    }
    await Sharing.shareAsync(dir);
  }
  
  await FileSystem.deleteAsync(dir);

}

export const getWifiInfo = async (name: string, id: string, type: string, data: string) => {
  try {
    const destination = `${FileSystem.documentDirectory}${id}${name}`;
    await FileSystem.writeAsStringAsync(destination, data, {encoding: 'base64'});
    const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
    const info = await getAudioMetadata(destination, wantedTags);
    await FileSystem.deleteAsync(destination);
    return info;
  }
  catch (error) {
    return {
      "fileType": type,
      "format": 'mp3',
      "metadata": {
        "album": '',
        "artist": '',
        "artwork": '',
        "name": ''
      }
    };
  }
}

export const importFiles = async (
  countdown: (value: number) => void,
  updateSize: (value: number) => void,
) => {
  const results = await DocumentPicker.getDocumentAsync({
    type: "audio/mpeg",
    multiple: true,
    copyToCacheDirectory: true
  });
  const songs: {}[] = [];
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  let data;
  if (results.canceled == false) {
    updateSize(results.assets.length);
    for (let i = 0; i < results.assets.length; i++) {
      countdown(results.assets.length - i);
      data = await FileSystem.readAsStringAsync(results.assets[i].uri, {encoding: 'base64'});
      let info = {};
      await getAudioMetadata(results.assets[i].uri, wantedTags)
        .then((meta) => {
          info = meta;
        })
        .catch((error) => {
          console.log(error);
        })
      songs.push({
        'name': results.assets[i].name,
        'id': idgen(10),
        'data': data,
        'info': info
      })
      await FileSystem.deleteAsync(results.assets[i].uri);
    }
    return songs;
  }
  else {
    return songs;
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

export const newCover = async () => {
  // TODO: import image and crop and save value to cover
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    selectionLimit: 1,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.3,
  });
  if (
    result.assets && 
    result.assets.length > 0 && 
    result.assets[0].base64 && 
    result.assets[0].mimeType &&
    (result.assets[0].mimeType == 'image/jpeg' || result.assets[0].mimeType == 'image/png') &&
    !result.canceled 
  ) {
    return `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
  }
  else {
    return '';
  }
}

export const saveEdits = (
  
  results: SongType[],
  ids: string[],
  title: string,
  artist: string,
  album: string,
  artwork: string

) => {

  /*


      TODO: Batch edits are kinda working, but sometimes it updates the song title, which it shouldn't


  */

  const NodeID3 = require('@/lib/node-id3')

  type tagsType = {
    title?: string;
    artist?: string;
    album?: string;
    APIC?: {
      description: string;
      // imageBuffer: Uint8Array;
      imageBuffer: string;
      mime: string;
    }
  }

  let tags: tagsType = {}

  let meta;
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && ids.includes(results[i].id)) {

      let newTitle = '';
      let newArtist = '';
      let newAlbum = '';
      let newArtwork = '';

      if (results[i].info.metadata) {
        meta = results[i].info.metadata;
      }

      if (title) {
        newTitle = title;
        tags.title = newTitle;
      }
      else if (meta && meta.name) {
        newTitle = meta.name;
        tags.title = newTitle;
      }

      if (artist) {
        newArtist = artist;
        tags.artist = newArtist;
      }
      else if (meta && meta.artist) {
        newArtist = meta.artist;
        tags.artist = newArtist;
      }

      if (album) {
        newAlbum = album;
        tags.album = newAlbum;
      }
      else if (meta && meta.album) {
        newAlbum = meta.album;
        tags.album = newAlbum;
      }

      if (artwork) {
        newArtwork = artwork;
      }
      else if (meta && meta.artwork) {
        newArtwork = meta.artwork;
      }

      if (newArtwork) {
        // questionable way to extract mime from start of string
        const infoString = newArtwork.split(/,(.*)/s)[0];
        const mimeTypeFull = infoString.split(/;(.*)/s)[0];
        const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
        // buffer after mimetype and encoding scheme
        const bufferString = newArtwork.split(/,(.*)/s)[1];
        tags.APIC = {
          description: 'Album Cover',
          imageBuffer: bufferString,
          // imageBuffer: toByteArray(artwork.split(/,(.*)/s)[1]),
          mime: mimeType
        };
      }

      if (results[i].data) {
        const newData = fromByteArray(NodeID3.writeExpo(toByteArray(results[i].data), tags));
        results[i].data = newData;
      }

      if (results[i].info) {
        results[i].info.metadata = {
          name: newTitle,
          artist: newArtist,
          album: newAlbum,
          artwork: newArtwork
        };
      }

    }
  }
  
  return results;
  
}

export const saveEditsOld = (
  results: [SongType],
  id: string,
  data: string,
  title: string,
  artist: string,
  album: string,
  artwork: string
) => {

  const NodeID3 = require('@/lib/node-id3');

  type tagsType = {
    title?: string;
    artist?: string;
    album?: string;
    APIC?: {
      description: string;
      // imageBuffer: Uint8Array;
      imageBuffer: string;
      mime: string;
    }
  };

  let tags: tagsType = {}

  if (title) {
    tags.title = title;
  }
  if (artist) {
    tags.artist = artist;
  }
  if (album) {
    tags.album = album;
  }
  if (artwork) {
    // questionable way to extract mime from start of string
    const infoString = artwork.split(/,(.*)/s)[0];
    const mimeTypeFull = infoString.split(/;(.*)/s)[0];
    const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
    // buffer after mimetype and encoding scheme
    const bufferString = artwork.split(/,(.*)/s)[1];
    tags.APIC = {
      description: 'Album Cover',
      imageBuffer: bufferString,
      // imageBuffer: toByteArray(artwork.split(/,(.*)/s)[1]),
      mime: mimeType
    };
  }

  const newData = fromByteArray(NodeID3.writeExpo(toByteArray(data), tags));

  for (let i = 0; i < results.length; i++) {
    if (results[i].id && results[i].id == id) {
      results[i].data = newData;
      if (results[i].info) {
        results[i].info.metadata = {
          name: title,
          artist: artist,
          album: album,
          artwork: artwork
        };
      }
    }
  }

  return results;
  
}

export const idgen = (len: number) => {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random()*10).toString();
  }
  return result;
}

export const maybeString = (value: any) => {
  return value ? value : '';
}