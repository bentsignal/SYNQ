import { View, Image, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '@/context/GlobalProvider'
import { Styles } from '@/constants/Styles'
import { Colors } from '@/constants/Colors'
import CustomButton from '@/components/CustomButton'
import { exportSongs} from '@/lib/SongManager'

const ImportControls = ({reset}: {reset?: () => void}) => {

  const { 

    setHomeState, results, setResults,
    exportDisabled, setExportDisabled, setLoading,
    setZipping, setImporting, 
    selectEnabled, selectedSongs,
    setShowDelete, setEditSong, setShowEdit,
    setTransferSize
    
  } = useGlobalContext();

  return (
    <>
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          display: selectEnabled && selectedSongs.length > 0 ? 'flex' : 'none',
          flexDirection: 'row',
          gap: 10
        }}
      >
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, {
            backgroundColor: Colors.song,
            padding: 15
          }]}
          onPress={() => {
            setEditSong({
              "name": "",
              "id": "",
              "data": "",
              "info": ""
            })
            setShowEdit(true);
          }}
        >
          <Image 
            source={require('@/assets/icons/edit.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, {
            backgroundColor: Colors.song,
            padding: 15
          }]}
          onPress={() => setShowDelete(true)}
        >
          <Image 
            source={require('@/assets/icons/delete.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          display: selectEnabled ? 'none' : 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          position: 'absolute',
          padding: 5,
          bottom: 10
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.text}
          handlePress={() => {
            setLoading(false);
            setZipping(false);
            setImporting(false);
            setTransferSize(0);
            setHomeState(0);
            setResults([]);
            setExportDisabled(true);
            if (reset) {
              console.log('reset')
              reset();
            }
          }}
        />
        <CustomButton 
          title='Export'
          background={Colors.main}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setZipping(true);
            setTimeout(() => {
              exportSongs(results).then(() => {
                setLoading(false);
                setZipping(false);
                setHomeState(3);
                setTransferSize(0);
                setResults([]);
                if (reset) {
                  console.log('reset')
                  reset();
                }
              })
              .catch((error) => {
                setLoading(false);
                setZipping(false);
                setHomeState(4);
                setTransferSize(0);
                setResults([]);
                if (reset) {
                  console.log('reset')
                  reset();
                }
              })
            }, 1000)
          }}
          disabled={exportDisabled}
        />
      </View>
    </>
  );
}

export default ImportControls;