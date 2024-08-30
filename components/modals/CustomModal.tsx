import { View, Modal } from 'react-native';
import { Styles } from '@/constants/Styles';

type CustomModalProps = {
  children: React.ReactNode;
  show: boolean;
  width: any;
  maxHeight?: any;
}

const CustomModal = ({ children, show, width, maxHeight }: CustomModalProps) => {
  return (
    <View>
      <Modal
        transparent={true}
        visible={show}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <View
            style={[Styles.popupBody, Styles.roundedContainer, {
              width: width,
              maxHeight: maxHeight ? maxHeight : '100%',
            }]}
          >
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default CustomModal;