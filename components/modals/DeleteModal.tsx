import { Text, View, TouchableOpacity, Modal } from 'react-native'

import PageTitle from '@/components/PageTitle'
import CustomButton from '@/components/CustomButton'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';
import { removeSong } from '@/lib/SongManager';

const DeleteModal = () => {
  const { showDelete, setShowDelete, deleteSong, results, setResults, setImportDisabled} = useGlobalContext();
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
              Delete song
            </Text>
            <Text
              style={{
                color: 'white',
                margin: 30,
                fontSize: 16
              }}
              numberOfLines={1}
            >
              {deleteSong.name}
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
                handlePress={async () => {
                  setShowDelete(false);
                  const newResults = removeSong(results, deleteSong.id);
                  if (newResults.length <= 0) {
                    setImportDisabled(true);
                  }
                  setResults(newResults);
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