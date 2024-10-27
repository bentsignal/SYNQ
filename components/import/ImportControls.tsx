import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { exportSongs, saveToLibrary } from '@/lib/SongManager';
import { darkenColor } from '@/lib/ColorManager';
import Notifications from '@/components/notifications/Notifications';
import Dropdown from '@/components/Dropdown';

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
      // padding: 5,
      width: '90%',
    },
    dropdownContainer: {
      width: '90%',
      marginBottom: 10,
    }
  });

  const handleEdit = () => {
    setEditSong({});
    setShowOverlay(true);
    setShowEdit(true);
  }

  const handleExport = async () => {
    try {
      setShowGlobalLoading(true);
      let songs = results.filter((result: any) => selectedSongs.includes(result.id));
      await exportSongs(songs);
      setShowGlobalLoading(false);
    }
    catch (error) {
      setShowGlobalLoading(false);
    }
  }

  const handleDelete = () => {
    setShowOverlay(true);
    setShowDelete(true);
  }

  const handleCancel = () => {
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
  }

  const handleImport = () => {
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
  }

  return (
    <View style={Local.container}>
      <Notifications />
      <View style={Local.batchButtonContainer}>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={handleEdit}
        >
          <Image 
            source={require('@/assets/icons/edit.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={handleExport}
        >
          <Image
            source={require('@/assets/icons/share.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[Styles.roundedContainer, Styles.backgroundBlendShadow, Local.batchButtonWrapper]}
          onPress={handleDelete}
        >
          <Image 
            source={require('@/assets/icons/delete.png')}
            style={Local.batchButtonIcon}
          />
        </TouchableOpacity>
      </View>
      {/* <Dropdown
          data={[]}
          down={false}
          setSelected={() => {}}
          disabled={exportDisabled}
          placeholder='Save options'
          containerStyles={Local.dropdownContainer}
        /> */}
      <View style={Local.mainButtonContainer}>
        <CustomButton 
          title='Cancel'
          background={Colors.altButton}
          handlePress={handleCancel}
          disabled={(homeState == 1 && transferSize > 0) || (homeState == 2 && loading)}
          disabledColor={Colors.altDisabled}
          customStyles={{flex: 1}}
        />
        <CustomButton 
          title='Next'
          background={theme}
          handlePress={handleImport}
          disabled={exportDisabled}
          disabledColor={darkenColor(theme, 40, 50)}
          customStyles={{flex: 1}}
        />
      </View>
    </View>
  );

}

export default ImportControls;