import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { InfoType } from '@/constants/Types'
import * as ImagePicker from 'expo-image-picker';
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import { Promise } from 'node-id3';

export const exportSongs = async (songs: any) => {

  const date = new Date();
  const dir = `${FileSystem.documentDirectory}${date.getMonth()}-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
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

export const importFiles = async () => {
  const results = await DocumentPicker.getDocumentAsync({
    type: "audio/mpeg",
    multiple: true,
    copyToCacheDirectory: true
  });
  const songs: {}[] = []
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  let data;
  if (results.canceled == false) {
    for (let i = 0; i < results.assets.length; i++) {
      data = await FileSystem.readAsStringAsync(results.assets[i].uri, {encoding: 'base64'})
      let info = {}
      await getAudioMetadata(results.assets[i].uri, wantedTags)
        .then((meta) => {
          info = meta
        })
        .catch((error) => {
          console.log(error)
        })
      songs.push({
        'name': results.assets[i].name,
        'uri': results.assets[i].uri,
        'data': data,
        'info': info
      })
    }
    return songs
  }
  else {
    return songs
  }
}

export const deleteSongFromFiles = async (uri: string) => {
  await FileSystem.deleteAsync(uri)
}

export const removeSongFromResults = (
  results: [{
    name?: string;
    data?: string;
    uri?: string;
    info?: InfoType
  }],
  uri: string
) => {
  let newResults = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].uri && results[i].uri != uri) {
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
    return `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`
  }
  else {
    return '';
  }
}

export const saveEdits = (
  results: [{
    name?: string;
    data: string;
    uri?: string;
    info: InfoType
  }],
  uri: string,
  data: string,
  title: string,
  artist: string,
  album: string,
  artwork: string
) => {
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
  if (title) {
    tags.title = title
  }
  if (artist) {
    tags.artist = artist
  }
  if (album) {
    tags.album = album
  }
  if (artwork) {
    // really stupid way to extract either image/png or image/jpeg from start of string
    const infoString = artwork.split(/,(.*)/s)[0]
    const mimeTypeFull = infoString.split(/;(.*)/s)[0]
    const mimeType = mimeTypeFull.split(/:(.*)/s)[1]
    // buffer after mimetype and encoding scheme
    const bufferString = artwork.split(/,(.*)/s)[1]
    tags.APIC = {
      description: 'Album Cover',
      imageBuffer: bufferString,
      // imageBuffer: toByteArray(artwork.split(/,(.*)/s)[1]),
      mime: mimeType
    }
  }
  const newData = fromByteArray(NodeID3.writeExpo(toByteArray(data), tags))
  for (let i = 0; i < results.length; i++) {
    if (results[i].uri && results[i].uri == uri) {
      results[i].data = newData
      if (results[i].info) {
        results[i].info.metadata = {
          name: title,
          artist: artist,
          album: album,
          artwork: artwork
        }
      }
    }
  }
  return results
  
}

export const fn = (data: any) => {
  return data !== undefined;
}