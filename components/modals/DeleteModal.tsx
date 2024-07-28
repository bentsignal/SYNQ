import { Text, View, TouchableOpacity, Modal } from 'react-native'

import CustomButton from '@/components/CustomButton'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';
import { removeSongs } from '@/lib/SongManager';

const DeleteModal = () => {
  
  const { 
    setShowDelete, showDelete, selectedSongs, deleteSong,
    results, setResults, setExportDisabled, setSelectEnabled
  }  = useGlobalContext();

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
                  setShowDelete(false);
                }}
              />
              <CustomButton 
                title='Delete'
                background={Colors.main}
                handlePress={() => {
                  setShowDelete(false);
                  const ids = selectedSongs.length > 0 ? selectedSongs : [deleteSong.id]
                  const newResults = removeSongs(results, ids);
                  if (newResults.length <= 0) {
                    setExportDisabled(true);
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
  )
}

export default DeleteModal;