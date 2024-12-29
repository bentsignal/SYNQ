import { View, StyleSheet } from "react-native";

const Plus = () => {
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
    // backgroundColor: 'blue',
    width: 30,
    height: 30,
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
    width: 3,
    height: 25,
    borderRadius: 10,
    backgroundColor: 'white',
  }
});

export default Plus;