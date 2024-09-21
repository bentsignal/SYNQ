import { View, StyleSheet } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import Overlay from "./Overlay";
import Progress from "./Progress";

const GlobalProgress = () => {

  const { globalProgress, showGlobalProgress } = useGlobalContext();

  const Local = StyleSheet.create({
    container: {
      display: showGlobalProgress ? 'flex' : 'none',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
    }
  });

  return (
    <View style={Local.container}>
      <Progress completion={globalProgress} showCircle={showGlobalProgress}/>
      <Overlay show={showGlobalProgress} activeOpacity={0.7}/>
    </View>
  );
}

export default GlobalProgress;
