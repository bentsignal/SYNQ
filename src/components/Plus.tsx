import { View, StyleSheet } from "react-native";

export default function Plus() {
  return (
    <View style={Local.container}>
      <View style={{
        ...Local.lineWrapper,
        opacity: 0,
      }}>
        <View style={Local.line}/>
      </View>
      <View style={{
        ...Local.lineWrapper,
        ...Local.lineWrapperPosition,
      }}>
        <View style={Local.line}/>
      </View>
      <View style={{
        ...Local.lineWrapper,
        ...Local.lineWrapperPosition,
        transform: [{rotate: '90deg'}],
      }}>
        <View style={Local.line}/>
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    width: 25,
    height: 25,
  },
  lineWrapper: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineWrapperPosition: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  line: {
    width: 2,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  }
});