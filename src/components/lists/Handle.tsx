import { View, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/Colors';


export default function Handle() {
  return (
    <View style={Local.container}>
      <View style={Local.handle}/>
      <View style={Local.handle}/>
      <View style={Local.handle}/>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    gap: 5,
    padding: 5,
  },
  handle: {
    width: '100%',
    height: '10%',
    backgroundColor: Colors.text,
    borderRadius: 5,
  },
});