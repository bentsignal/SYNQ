import { Text, View, Image } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '@/components/CustomButton'
import { importSongs } from '@/lib/SongManager'

const FilesEmpty = () => {
  const { homeState, setHomeState, fileResults, setFileResults, setImportDisabled } = useGlobalContext();
  return (
    <View
      style={{
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        height: '75%',
        marginBottom: 10
      }}
    >
      <Image 
        source={require('@/assets/icons/upload.png')}
        style={{
          width: 35,
          height: 35
        }}
      />
      <Text style={[Styles.infoText, {
        paddingTop: 20
      }]}>
        press browse to begin importing files
      </Text>
      <Text style={[Styles.infoText, {
        paddingTop: 10,
        paddingBottom: 20
      }]}>
        Supports: mp3
      </Text>
      <CustomButton 
        title='Browse'
        background={Colors.altButton}
        handlePress={async () => {
          const results = await importSongs()
          if (results.length > 0) {
            setImportDisabled(false)
            setFileResults(results)
          }
        }}
      />
    </View>
  );
}

export default FilesEmpty;