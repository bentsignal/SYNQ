import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { exportSongs, saveToLibrary } from '@/lib/SongManager';
import { darkenColor } from '@/lib/ColorManager';
import Notifications from '@/components/notifications/Notifications';

const ImportControls = (
  {altTitle, mainTitle, altHandle, mainHandle, altDisabled, mainDisabled}: {
  altTitle?: string,
  mainTitle?: string,
  altHandle?: () => void,
  mainHandle?: () => void,
  altDisabled?: boolean,
  mainDisabled?: boolean,
}) => {

  const {

    results, loading, transferSize,
    exportDisabled, homeState, selectEnabled,
    selectedSongs, premium, theme,

    setShowDelete, setEditSong, setShowEdit, 
    setShowOverlay, setShowGlobalLoading,

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
      <View style={Local.mainButtonContainer}>
        <CustomButton 
          title={altTitle ?? 'Cancel'}
          background={Colors.altButton}
          handlePress={altHandle}
          disabled={altDisabled}
          disabledColor={Colors.altDisabled}
          customStyles={{flex: 1}}
        />
        <CustomButton 
          title={mainTitle ?? 'Next'}
          background={theme}
          handlePress={mainHandle}
          disabled={mainDisabled}
          disabledColor={darkenColor(theme, 40, 50)}
          customStyles={{flex: 1}}
        />
      </View>
    </View>
  );

}

export default ImportControls;