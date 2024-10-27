import { View, StyleSheet } from 'react-native';
import { Styles } from '@/constants/Styles';

const Arrow = ({style}: {style: {}}) => {
  return (
    <View style={{...Local.arrowContainer, ...style}}>
      <View style={[Local.arrow, Local.topArrow]}/>
      <View style={[Local.arrow, Local.bottomArrow]}/>
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
    backgroundColor: 'black',
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