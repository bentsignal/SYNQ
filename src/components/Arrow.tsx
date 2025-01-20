import { View, StyleSheet } from 'react-native';
import { Styles } from '@/src/constants/Styles';

type ArrowProps = {
  containerStyle?: {};
  arrowStyle?: {};
  arrowLength?: number;
  arrowWidth?: number;
}

const Arrow = ({containerStyle, arrowStyle, arrowLength, arrowWidth}: ArrowProps) => {
  
  const Local = StyleSheet.create({
    arrowContainer: {
      flexDirection: 'row',
      width: arrowLength ?? 15,
      height: arrowLength ?? 15,
      transform: [{translateY: -3}, {rotate: '-135deg'}],
    },
    arrow: {
      position: 'absolute',
      top: 0,
      left: 0,
      borderRadius: 100,
    },
    topArrow: {
      width: arrowWidth ?? 3,
      height: arrowLength ?? 15,
    },
    bottomArrow: {
      width: arrowLength ?? 15,
      height: arrowWidth ?? 3,
    },
  });
  
  return (
    <View style={[Local.arrowContainer, containerStyle]}>
      <View style={[Local.arrow, Local.topArrow, arrowStyle]}/>
      <View style={[Local.arrow, Local.bottomArrow, arrowStyle]}/>
    </View>
  );
}

export default Arrow;