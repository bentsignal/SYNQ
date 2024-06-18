import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { ID3Writer } from 'browser-id3-writer'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { InfoType } from '@/constants/Types'
import * as ImagePicker from 'expo-image-picker';
import JSZip from 'jszip'

export const exportSongs = async (songs: any) => {
  if (songs.length > 1) {
    const zip = new JSZip();
    let song;
    for (let i = 0; i < songs.length; i++) {
      song = songs[i];
      zip.file(song.name, song.data, {base64: true});
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
  else if (songs.length == 1) {
    const original = songs[0]
    const renamed = FileSystem.documentDirectory + original.name
    await FileSystem.moveAsync({from: original.uri, to:renamed}).then(async () => {
      await Sharing.shareAsync(renamed)
    })
  }
}

export const addArtist = (artist: string, data: string) => {
  let songBuffer = base64ToArrayBuffer(data);
  const writer = new ID3Writer(songBuffer);
  writer.setFrame('TPE1', ['Kendrick Lamar']);
  writer.addTag();
  const blob = writer.getBlob;
  console.log(blob)
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
    // const info = await FileSystem.getInfoAsync(result.assets[0].uri)
    // const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {encoding: 'base64'})
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
    quality: 1,
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

const base64ToArrayBuffer = (base64: string) => {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const fn = (data: any) => {
  return data !== undefined;
}