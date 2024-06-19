import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { ID3Writer } from 'browser-id3-writer'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { InfoType } from '@/constants/Types'
import * as ImagePicker from 'expo-image-picker';
import JSZip from 'jszip'
import { btoa, atob, toByteArray, fromByteArray } from 'react-native-quick-base64'

export const exportSongs = async (songs: any) => {
  const zip = new JSZip();
  for (let i = 0; i < songs.length; i++) {
    zip.file(songs[i].name, songs[i].data, {base64: true});
  }
  await zip.generateAsync({type:"base64"}).then(async (content) => {
    const date = new Date();
    const fileName = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.zip`
    const destination = FileSystem.documentDirectory + fileName
    await FileSystem.writeAsStringAsync(destination, content, {encoding: 'base64'}).then(async () => {
      await Sharing.shareAsync(destination)
    })
  })
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
  const tags = {
    title: title,
    artist: artist,
    album: album
  }
  const newData = fromByteArray(NodeID3.writeExpo(toByteArray(data), tags))
  console.log(newData.slice(0, 4000))
  for (let i = 0; i < results.length; i++) {
    if (results[i].uri && results[i].uri == uri) {
      results[i].data = newData
      if (results[i].info.metadata) {
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