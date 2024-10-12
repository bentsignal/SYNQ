import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { exportSongs, saveToLibrary } from '@/lib/SongManager';
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
    setTransferSize, setShowOverlay,
    setShowGlobalLoading,

  } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 10,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    batchButtonContainer: {
      display: selectEnabled && selectedSongs.length > 0 ? 'flex' : 'none',
      flexDirection: 'row',
      gap: 10
    },
    batchButtonWrapper: {
      backgroundColor: Colors.song,
      padding: 15
    },
    batchButtonIcon: {
      width: 20,
      height: 20,
      tintColor: Colors.text
    },
    mainButtonContainer: {
      display: selectEnabled ? 'none' : 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      padding: 5,
    }
  });

  return (
    <View style={Local.container}>
      <Notifications />
      <View style={Local.batchButtonContainer}>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={() => {
            setEditSong({});
            setShowOverlay(true);
            setShowEdit(true);
          }}
        >
          <Image 
            source={require('@/assets/icons/edit.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={async () => {
            try {
              setShowGlobalLoading(true);
              let songs = results.filter((result: any) => selectedSongs.includes(result.id));
              await exportSongs(songs);
              setShowGlobalLoading(false);
            }
            catch (error) {
              setShowGlobalLoading(false);
            }
          }}
        >
          <Image
            source={require('@/assets/icons/share.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={() => {
            setShowOverlay(true);
            setShowDelete(true);
          }}
        >
          <Image 
            source={require('@/assets/icons/delete.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={Local.mainButtonContainer}>
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
          title='Import'
          background={theme}
          handlePress={() => {
            setExportDisabled(true);
            setLoading(true);
            setZipping(true);
            const songs = premium ? results : [results[0]]
            const progress = (value: number) => {
              // TODO: Implement progress
            }
            setTimeout(() => {
              saveToLibrary(songs, progress).then(() => {
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
            }, 10)
          }}
          disabled={exportDisabled}
          disabledColor={darkenColor(theme, 40, 50)}
        />
      </View>
    </View>
  );

}

export default ImportControls;