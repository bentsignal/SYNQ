import { Text, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import JSZip from 'jszip'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import FilesEmpty from '@/components/import/FilesEmpty'
import SongList from '@/components/SongList'
import ImportOption from '@/components/import/ImportOption'
import ImportInstructions from '@/components/import/ImportInstructions'
import CustomButton from '../CustomButton'

const Files = () => {
  const { homeState, setHomeState, fileResults, setFileResults,
    importDisabled, setImportDisabled
   } = useGlobalContext();
  let body;
  if (fileResults.length == 0) {
    body = <FilesEmpty />
  }
  else {
    body = <SongList songs={fileResults}/>
  }
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Import Music' />
      {body}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.text}
          handlePress={() => {
            setHomeState(0)
            setFileResults([])
          }}
        />
        <CustomButton 
          title='Import'
          background={Colors.green}
          handlePress={async () => {
            setImportDisabled(true);
            if (fileResults.length > 1) {
              const zip = new JSZip();
              let base64_content, song
              for (let i = 0; i < fileResults.length; i++) {
                song = fileResults[i]
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
            else if (fileResults.length == 1) {
              const original = fileResults[0]
              const renamed = FileSystem.documentDirectory + original.name
              const rename = await FileSystem.moveAsync({from: original.uri, to:renamed}).then(async () => {
                const shareSong = await Sharing.shareAsync(renamed)
              })
            }
            router.replace('/library');
            setHomeState(0);
            setFileResults([]);
          }}
          disabled={importDisabled}
        />
      </View>
    </SafeAreaView>
  )
}

export default Files;