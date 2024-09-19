import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const Styles = StyleSheet.create({

  // Text styles
  h1: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  h5: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  h6: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  p: {
    fontSize: 16,
  },
  sub: {
    fontSize: 14,
  },
  textboxLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 5
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text
  },
  description: {
    fontSize: 16,
    color: Colors.infoText,
    marginBottom: 20,
    width: '100%',
  },

  // Container styles
  body: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    margin: 'auto'
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  roundedContainer: {
    borderRadius: 15
  },
  popupBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  popupBody: {
    backgroundColor: Colors.popup,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textbox: {
    backgroundColor: Colors.textbox,
    color: Colors.text,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  backgroundBlendShadow: {
    shadowColor: Colors.background,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },

});