import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';

export const Styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    width: '90%',
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
  roundedContainer: {
    borderRadius: 15
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
    fontSize: 14,
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
  }
});