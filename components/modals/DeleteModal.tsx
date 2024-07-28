import { Text, View, TouchableOpacity, Modal } from 'react-native'

import CustomButton from '@/components/CustomButton'
import { Colors } from '@/constants/Colors'
import { Styles } from '@/constants/Styles'
import { useGlobalContext } from '@/context/GlobalProvider';

const DeleteModal = ( {show, title, message, handler} : {

  show: boolean;
  title: string;
  message: any;
  handler: () => void;

} ) => {
  
  const { setShowDelete }  = useGlobalContext();

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Modal
        transparent={true}
        visible={show}
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
              {title}
            </Text>
            <Text
              style={{
                color: 'white',
                margin: 30,
                fontSize: 16
              }}
              numberOfLines={1}
            >
              {message}
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
                handlePress={handler}
              />
            </View>
          </View> 
        </View>
      </Modal>
    </View>
  )
}

export default DeleteModal;