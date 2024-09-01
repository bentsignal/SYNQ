import { View, Image, TouchableOpacity } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { exportSongs} from '@/lib/SongManager';
import { darkenColor } from '@/lib/ColorManager';
import Notifications from '@/components/notifications/Notifications';

const ImportControls = ({reset}: {reset?: () => void}) => {

  const {

    results, loading, transferSize,
    exportDisabled, homeState, selectEnabled,
    selectedSongs, premium, theme,

    setHomeState, setResults, setExportDisabled,
    setLoading, setZipping, setImporting, 
    setShowDelete, setEditSong, setShowEdit, 
    setTransferSize, setShowOverlay

  } = useGlobalContext();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 10,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Notifications />
      <View
        style={{
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
            });
            setShowOverlay(true);
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
          onPress={() => {
            setShowOverlay(true);
            setShowDelete(true);
          }}
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
          padding: 5,
        }}
      >
        <CustomButton 
          title='Cancel'
          background={Colors.altButton}
          handlePress={() => {
            setLoading(false);
            setZipping(false);
            setImporting(false);
            setTransferSize(0);
            setHomeState(0);
            setResults([]);
            setExportDisabled(true);
            if (reset) {
              reset();
            }
          }}
          disabled={(homeState == 1 && transferSize > 0) || (homeState == 2 && loading)}
          disabledColor={Colors.altDisabled}
        />
        <CustomButton 
          title='Export'
          background={theme}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setZipping(true);
            const songs = premium ? results : [results[0]]
            setTimeout(() => {
              exportSongs(songs).then(() => {
                setLoading(false);
                setZipping(false);
                setHomeState(3);
                setTransferSize(0);
                setResults([]);
                if (reset) {
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
                  reset();
                }
              })
            }, 1000)
          }}
          disabled={exportDisabled}
          disabledColor={darkenColor(theme, 40, 50)}
        />
      </View>
    </View>
  );

}

export default ImportControls;