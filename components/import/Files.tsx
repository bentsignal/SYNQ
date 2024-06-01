import { Text, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'

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
    body = <SongList />
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
          handlePress={() => {
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