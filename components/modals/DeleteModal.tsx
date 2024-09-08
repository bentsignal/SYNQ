import { Text, View, Modal } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { removeSongs } from '@/lib/SongManager';

const DeleteModal = () => {

  const {

    selectedSongs, deleteSong, results,
    showDelete, theme, homeState,

    setShowDelete, setResults, setExportDisabled,
    setSelectEnabled, setShowOverlay, setHomeState,

  } = useGlobalContext();

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Modal
        transparent={true}
        visible={showDelete}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <View
            style={[Styles.popupBody, Styles.roundedContainer, {
              padding: 20,
              width: '80%',
            }]}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 36,
                fontWeight: 'bold'
              }}
            >
              {selectedSongs.length > 0 ? 'Delete Songs' : 'Delete Song'}
            </Text>
            <Text
              style={{
                color: 'white',
                margin: 30,
                fontSize: 16
              }}
              numberOfLines={1}
            >
              {selectedSongs.length > 0 ? `Delete ${selectedSongs.length} songs?` : deleteSong.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                marginBottom: 5
              }}
            >
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
                  const ids = selectedSongs.length > 0 ? selectedSongs : [deleteSong.id]
                  const newResults = removeSongs(results, ids);
                  if (newResults.length <= 0) {
                    setExportDisabled(true);
                  }
                  if (newResults.length === 0) {
                    setHomeState(0);
                  }
                  setResults(newResults);
                  setSelectEnabled(false);
                }}
              />
            </View>
          </View> 
        </View>
      </Modal>
    </View>
  );
  
}

export default DeleteModal;