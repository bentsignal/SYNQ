import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/Colors';

type MoreProps = {
  color?: string;
  handlePress: () => void;
  style?: StyleProp<ViewStyle>;
}

const More = ({handlePress, color, style}: MoreProps) => {

  const Local = StyleSheet.create({
    dot: {
      width: 4,
      height: 4,
      borderRadius: 15,
      backgroundColor: color ?? Colors.text,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
      gap: 3,
      ...(style ? StyleSheet.flatten(style) : {}),
    }
  });

  const Dot = () => {
    return (
      <View style={Local.dot}/>
    );
  }

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={Local.container}
    >
      <Dot />
      <Dot />
      <Dot />
    </TouchableOpacity>
  );
}

export default More;
