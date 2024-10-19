import { Text, View, Modal, StyleSheet } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { removeSongs, deleteFromLibrary } from '@/lib/SongManager';
import { ListCover } from '@/components/song/Cover';
import SongInfo from '@/components/song/SongInfo';
import { PageType, SongType } from '@/constants/Types';

const DeleteModal = () => {

  const {

    selectedSongs, results,
    showDelete, theme, homeState,
    editSong, numModified,
    queue, nextUp,

    setShowDelete, setResults, setExportDisabled,
    setSelectEnabled, setShowOverlay, setHomeState,
    setNumModified, setQueue, setNextUp,

  } = useGlobalContext();

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
                handlePress={() => {
                  setShowOverlay(false);
                  setShowDelete(false)
                }}
              />
              <CustomButton 
                title='Delete'
                background={theme}
                handlePress={() => {
                  setShowOverlay(false);
                  setShowDelete(false);
                  setSelectEnabled(false);
                  // remove from library
                  if (editSong.pageType === PageType.LIBRARY) {
                    deleteFromLibrary(editSong.id);
                    // remove from queue and next up if applicable
                    setQueue(queue.filter((song: SongType) => song.id !== editSong.id));
                    setNextUp(nextUp.filter((song: SongType) => song.id !== editSong.id));
                    setNumModified(numModified + 1);
                  }
                  // remove from import
                  else if (editSong.pageType === PageType.IMPORT) {
                    const ids = selectedSongs.length > 0 ? selectedSongs : [editSong.id]
                    const newResults = removeSongs(results, ids);
                    if (newResults.length <= 0) {
                      setExportDisabled(true);
                    }
                    if (newResults.length === 0) {
                      setHomeState(0);
                    }
                    setResults(newResults);
                  }
                }}
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