import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const More = ({handlePress}: {handlePress: () => void}) => {

  const Local = StyleSheet.create({
    dot: {
      width: 4,
      height: 4,
      borderRadius: 15,
      backgroundColor: Colors.text,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
      gap: 3,
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
