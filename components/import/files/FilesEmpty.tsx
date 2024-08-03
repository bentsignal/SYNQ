import { Text, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { importFiles } from '@/lib/SongManager';

const getShowSaveInst = async() => {
  return await AsyncStorage.getItem('showSaveInst')
}

const FilesEmpty = () => {

  const { 

    setResults, setExportDisabled, setLoading, setImporting,
    setShowSaveInst, setHomeState

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
        Press browse to import files
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
          setLoading(true);
          setImporting(true);
          importFiles().then((results) => {
            setImporting(false);
            setLoading(false)
            if (results.length > 0) {
              getShowSaveInst().then((value) => {
                value === 'false' ? setShowSaveInst(false) : setShowSaveInst(true);
              })
              .catch((error) => {
                setShowSaveInst(false);
              })
              setExportDisabled(false);
              setResults(results);
            }
          })
          .catch((error) => {
            setLoading(false);
            setImporting(false);
            setHomeState(4);
          })
        }}
      />
    </View>
  );
  
}

export default FilesEmpty;