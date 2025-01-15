import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import CustomButton from '@/components/CustomButton';
import { removeSongs } from '@/lib/controllers/SongController';
import { deleteFromLibrary } from '@/lib/controllers/LibraryController';
import { darkenColor } from '@/lib/controllers/ColorController';
import Notifications from '@/components/notifications/Notifications';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { Track } from 'react-native-track-player';
import { PageType } from '@/constants/Types';
import TrackPlayer from 'react-native-track-player';
import { removeFromAllPlaylists } from '@/lib/controllers/PlaylistController';
import { router } from 'expo-router';

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

    results, selectEnabled,
    selectedSongs, editSong,
    numModified,

    setEditSong, 
    setResults, setNumModified,
    setExportDisabled, setHomeState,
    setSelectEnabled,

  } = useGlobalContext();

  const { theme } = useThemeContext();

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
    router.push(`/song/edit/${editSong.id}`);
  }

  const executeDelete = async () => {
    try {
      // handle bulk delete
      if (selectedSongs.length > 0) {
        const newResults = await removeSongs(results, selectedSongs);
        if (newResults.length <= 0) {
          setExportDisabled(true);
          setHomeState(0);
        }
        setResults(newResults);
      }
      // remove from library
      else if (editSong.pageType === PageType.LIBRARY) {
        deleteFromLibrary(editSong.id);
        removeFromAllPlaylists(editSong.id);
        // remove from queue and next up if applicable
        const queue = await TrackPlayer.getQueue();
        const indiciesToRemove = queue
          .map((track: Track, index: number) => track.id === editSong.id ? index : -1)
          .filter(index => index !== -1);
        await TrackPlayer.remove(indiciesToRemove);
        setNumModified(numModified + 1);
      }
      // remove from import
      else if (editSong.pageType === PageType.IMPORT) {
        const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id]
        const newResults = await removeSongs(results, ids);
        if (newResults.length <= 0) {
          setExportDisabled(true);
        }
        if (newResults.length === 0) {
          setHomeState(0);
        }
        setResults(newResults);
      }
    }
    catch (error) {
      console.log('error deleting song: ', error);
    }
    setSelectEnabled(false);
  }

  const handleDelete = () => {
    Alert.alert(
      `${selectedSongs.length > 1 ? 'Delete songs' : 'Delete song'}`,
      `Are you sure you want to delete ${selectedSongs.length > 1 ? 'these songs' : 'this song'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          executeDelete();
        }}
      ]
    );
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