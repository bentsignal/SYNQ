import { Text, View, Modal, StyleSheet } from 'react-native';
import CustomButton from '@/src/components/CustomButton';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { useGlobalContext } from '@/src/context/GlobalProvider';
import { removeSongs } from '@/src/controllers/SongController';
import { deleteFromLibrary } from '@/src/controllers/LibraryController';
import ListCover from '@/src/components/cover/ListCover';
import SongInfo from '@/src/components/song/SongInfo';
import { PageType, CoverType } from '@/src/constants/Types';
import TrackPlayer, { Track } from 'react-native-track-player';
import { removeFromAllPlaylists } from '@/src/controllers/PlaylistController';
import { useThemeContext } from '@/src/context/ThemeProvider';

const DeleteModal = () => {

  const {

    selectedSongs, results,
    showDelete, homeState,
    editSong, numModified,

    setShowDelete, setResults, setExportDisabled,
    setSelectEnabled, setShowOverlay, setHomeState,
    setNumModified, 

  } = useGlobalContext();

  const { theme } = useThemeContext();

  const getBody = () => {
    if (selectedSongs.length > 0) {
      return (
        <Text style={[Styles.p, Local.bulkMessage]}>
          Are you sure?
        </Text>
      );
    }
    else {
      return (
        <View style={[Local.infoContainer, Styles.roundedContainer]}>
          <ListCover 
            image={editSong.info?.metadata?.artwork}
            type={CoverType.SONG}
            id={editSong.id}
            propOnLoad={() => {}}
          />
          <SongInfo 
            info={editSong.info ? editSong.info : {metadata: {}}} 
            name={editSong.name ? editSong.name : ''}
          />
        </View>
      );
    }
  }

  const handleCancel = () => {
    setShowOverlay(false);
    setShowDelete(false)
  }

  const handleDelete = async () => {
    setShowOverlay(false);
    setShowDelete(false);
    setSelectEnabled(false);
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

  return (
    <View style={Local.container}>
      <Modal
        transparent={true}
        visible={showDelete}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <View style={[Styles.popupBody, Styles.roundedContainer, Local.contentContainer]}>
            <Text style={[Styles.h2, Local.textColor]}>
              {selectedSongs.length > 1 ? `Delete ${selectedSongs.length} Songs` : 'Delete Song'}
            </Text>
            {getBody()}
            <View style={Local.buttonContainer}>
              <CustomButton 
                title='Cancel'
                background={Colors.altButton}
                handlePress={handleCancel}
              />
              <CustomButton 
                title='Delete'
                background={theme}
                handlePress={handleDelete}
              />
            </View>
          </View> 
        </View>
      </Modal>
    </View>
  );
  
}

const Local = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    padding: 20,
    width: '80%',
  },
  textColor: {
    color: Colors.text
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.song,
    padding: 15,
  },
  bulkMessage: {
    color: Colors.text,
    margin: 30,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5
  }
});

export default DeleteModal;