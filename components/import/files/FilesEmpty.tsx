import { Text, View, Image } from 'react-native'

import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'

import CustomButton from '@/components/CustomButton'
import { importFiles } from '@/lib/SongManager'

const FilesEmpty = () => {

  const { setFileResults, setImportDisabled, setLoading, setImporting
  } = useGlobalContext();

  return (
    <View
      style={[Styles.main, {
        paddingBottom: 50
      }]}
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
        handlePress={() => {
          setLoading(true)
          setImporting(true);
          importFiles().then((results) => {
            setImporting(false);
            setLoading(false)
            if (results.length > 0) {
              setImportDisabled(false)
              setFileResults(results)
            }
          })
        }}
      />
    </View>
  );
  
}

export default FilesEmpty;