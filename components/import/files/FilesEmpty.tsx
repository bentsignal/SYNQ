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

    transferSize, loadAnimInProgress,

    setResults, setExportDisabled, setLoading, 
    setImporting, setShowSaveInst, setHomeState,
    setTransferSize, setTransferProgress, 
    setLoadAnimInProgress,

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
          height: 35,
          tintColor: Colors.main,
        }}
      />
      <Text style={[Styles.infoText, {
        paddingTop: 20
      }]}>
        Press browse to import files
      </Text>
      <Text style={[Styles.infoText, {
        fontWeight: 'regular',
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
          const updateCountdown = (value: number) => setTransferProgress(value);
          const updateSize = (value: number) => {
            setTransferSize(value)
            if (value > 2) {
              setLoadAnimInProgress(true);
            }
          };
          importFiles(updateCountdown, updateSize).then((results) => {
            setTransferSize(-1);
            setTransferProgress(-1);
            setImporting(false);
            setLoading(false);
            if (results.length > 0) {
              setExportDisabled(false);
              setResults(results);
            }
          })
          .catch((error) => {
            console.log(error);
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