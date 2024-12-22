import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';

const ModalStyles = StyleSheet.create({
  roundedTop: {
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
  },
  header: {
    ...Styles.h2,
    color: Colors.text,
    marginTop: 10,
    marginBottom: 15,
  }
});

export default ModalStyles;
