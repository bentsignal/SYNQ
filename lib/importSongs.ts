import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import JSZip from 'jszip'

const importSongs = async (songs: any) => {
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

export default importSongs