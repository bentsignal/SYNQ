import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const Styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    width: '90%',
    margin: 'auto'
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.green,
  },
  top: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
    alignSelf: 'stretch',
    color: Colors.text,
    marginBottom: 20
  },
  buttonContainer: {
    width: 100,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  infoText: {
    fontSize: 14,
    color: Colors.text
  }
});