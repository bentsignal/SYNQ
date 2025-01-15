import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';

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
    color: Colors.infoText,
  },
  textboxLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
    width: '90%',
    marginBottom: 10,
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

  // tab bar styles
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
    color: Colors.tabInactive,
  },

  // Container styles
  header: {
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  headerContent: {
    backgroundColor: Colors.background,
    height: 300,
  },
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
  roundedModal: {
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
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
  listItem: {
    alignSelf: 'stretch',
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 90,
    marginBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },

  // general styles
  divider: {
    width: '100%',
    height: 5,
    borderBottomColor: Colors.song,
    borderBottomWidth: 1,
    marginBottom: 10,
  }

});