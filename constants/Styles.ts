import { StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

export const Styles = StyleSheet.create({
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
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.popup,
    backgroundColor: Colors.footer,
    height: '11%',
    paddingTop: 10,
    paddingBottom: Dimensions.get('screen').height < 700 ? 15 : 30
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.main,
  },
  top: {
    width: '90%',
    alignSelf: 'center',
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
  },
  roundedContainer: {
    borderRadius: 15
  },
  popupBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)'
  },
  popupBody: {
    backgroundColor: Colors.popup,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: 100,
    height: 42,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    color: Colors.text
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
  textboxLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 5
  },
  backgroundBlendShadow: {
    shadowColor: Colors.background,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  }
});