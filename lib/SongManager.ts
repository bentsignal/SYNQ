import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import JSZip from 'jszip'

export const exportSongs = async (songs: any) => {
  console.log(songs)
  if (songs.length > 1) {
    const zip = new JSZip();
    let base64_content, song
    for (let i = 0; i < songs.length; i++) {
      song = songs[i]
      base64_content = await FileSystem.readAsStringAsync(song.uri, {encoding: 'base64'})
      zip.file(song.name, base64_content, {base64: true})
    }
    zip.generateAsync({type:"base64"}).then((content) => {
      const date = new Date();
      const fileName = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.zip`
      const destination = FileSystem.documentDirectory + fileName
      FileSystem.writeAsStringAsync(destination, content, {encoding: 'base64'}).then(async () => {
        const shareSong = await Sharing.shareAsync(destination)
      })
    })
  }
  else if (songs.length == 1) {
    const original = songs[0]
    const renamed = FileSystem.documentDirectory + original.name
    const rename = await FileSystem.moveAsync({from: original.uri, to:renamed}).then(async () => {
      const shareSong = await Sharing.shareAsync(renamed)
    })
  }
}

export const importSongs = async () => {
  const results = await DocumentPicker.getDocumentAsync({
    type: "audio/mpeg",
    multiple: true,
    copyToCacheDirectory: true
  });
  const songs: {}[] = []
  if (results.canceled == false) {
    const NodeID3 = require('@/lib/node-id3')
    for (let i = 0; i < results.assets.length; i++) {
      const data = await FileSystem.readAsStringAsync(results.assets[i].uri, {encoding: 'base64'})
      songs.push({
        'name': results.assets[i].name,
        'uri': results.assets[i].uri,
        'data': data,
        'tags': NodeID3.readExpo(data)
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