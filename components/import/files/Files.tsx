import { Text, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import PageTitle from '@/components/PageTitle'
import Top from '@/components/Top'
import FilesEmpty from '@/components/import/files/FilesEmpty'
import SongList from '@/components/song/SongList'
import CustomButton from '@/components/CustomButton'
import importSongs from '@/lib/importSongs'

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
            await importSongs(fileResults)
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