import { Text, View, TouchableOpacity, Modal } from 'react-native'

import PageTitle from '@/components/PageTitle'
import CustomButton from '@/components/CustomButton'
import { Colors } from '@/constants/Colors'
import { useGlobalContext } from '@/context/GlobalProvider';

const Delete = () => {
  const { showDelete, setShowDelete, deleteSong } = useGlobalContext();
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
        animationType='fade'
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <View
            style={{
              backgroundColor: Colors.popup,
              padding: 20,
              justifyContent: 'center',
              alignItems: 'center',
              width: '70%',
              borderRadius: 10
            }}
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
                background={Colors.green}
                handlePress={() => {
                  setShowDelete(false);
                  // TODO: delete
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Delete;