import { View, Modal, StyleSheet } from 'react-native';
import { Styles } from '@/constants/Styles';

type CustomModalProps = {
  children: React.ReactNode;
  show: boolean;
  width: any;
  maxHeight?: any;
}

const CustomModal = ({ children, show, width, maxHeight }: CustomModalProps) => {
  const Local = StyleSheet.create({
    container: {
      width: width,
      maxHeight: maxHeight ? maxHeight : '100%',
    }
  });
  return (
    <View>
      <Modal
        transparent={true}
        visible={show}
        animationType='slide'
      >
        <View style={Styles.popupBackdrop}>
          <View style={[Styles.popupBody, Styles.roundedContainer, Local.container]}>
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default CustomModal;