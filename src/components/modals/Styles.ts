import { StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';

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
  },
  fieldWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyListFiller: {
    ...Styles.h5,
    color: Colors.infoText,
    width: '90%',
    textAlign: 'left',
  },
  fieldLabel: {
    ...Styles.textboxLabel,
    fontSize: 18,
    color: Colors.text,
  },
  fieldValue: {
    ...Styles.h5,
    color: Colors.infoText,
  },
});

export default ModalStyles;
