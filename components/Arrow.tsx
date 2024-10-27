import { View, StyleSheet } from 'react-native';
import { Styles } from '@/constants/Styles';

const Arrow = ({containerStyle, arrowStyle}: {containerStyle?: {}, arrowStyle?: {}}) => {
  return (
    <View style={{...Local.arrowContainer, ...containerStyle}}>
      <View style={[Local.arrow, Local.topArrow, arrowStyle]}/>
      <View style={[Local.arrow, Local.bottomArrow, arrowStyle]}/>
    </View>
  );
}

const Local = StyleSheet.create({
  arrowContainer: {
    flexDirection: 'row',
    width: 15,
    height: 15,
    transform: [{translateY: -3}, {rotate: '-135deg'}],
  },
  arrow: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 100,
  },
  topArrow: {
    width: 3,
    height: 15,
  },
  bottomArrow: {
    width: 15,
    height: 3,
  },
});

export default Arrow;