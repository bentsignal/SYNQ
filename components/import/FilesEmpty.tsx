import { Text, View, Image } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '../CustomButton'

const FilesEmpty = () => {
  const { homeState, setHomeState, fileResults, setFileResults } = useGlobalContext();
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
          const result = await DocumentPicker.getDocumentAsync({
            type: "audio/mpeg",
            multiple: true,
            copyToCacheDirectory: true
          });
          if (result.assets != null) {
            setFileResults(result.assets)
          }
        }}
      />
    </View>
  );
}

export default FilesEmpty;