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
import SongList from '@/components/import/SongList'
import ImportOption from '@/components/import/ImportOption'
import ImportInstructions from '@/components/import/ImportInstructions'
import CustomButton from '../CustomButton'

const Files = () => {
  const { homeState, setHomeState, fileResults, setFileResults } = useGlobalContext();
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
            const zip = new JSZip();
            const song1 = fileResults[0]
            const song1_base64 = await FileSystem.readAsStringAsync(song1.uri, {encoding: 'base64'})
            zip.file(song1.name, song1_base64, {base64: true})
            zip.generateAsync({type:"string"}).then((content) => {
              const destination = FileSystem.documentDirectory + 'test.zip'
              FileSystem.writeAsStringAsync(destination, content, {encoding: 'base64'}).then(async () => {
                const shareSong = await Sharing.shareAsync(destination)
              })
            })
            router.replace('/library');
            setHomeState(0);
            setFileResults([]);
          }}
          disabled={fileResults.length == 0 ? true : false}
        />
      </View>
    </SafeAreaView>
  )
}

export default Files;