import { View, StyleSheet, Text } from "react-native";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import Overlay from "./Overlay";
import Progress from "./Progress";
import Ad from "./Ad";
import { useThemeContext } from "@/src/context/ThemeProvider";

const GlobalProgress = () => {

  const { 
    
    globalProgress, showGlobalLoading,
    showImportAd,
    
    showGlobalProgress 

  } = useGlobalContext();

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      display: showGlobalLoading ? 'flex' : 'none',
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

  const getAdMessage = () => {
    return (
      <Text>Import multiple files at once, and remove all ads with <Text style={{color: theme}}>Premium</Text></Text>
    )
  }

  return (
    <View style={Local.container}>
      <Progress 
        completion={globalProgress} 
        loading={showGlobalLoading} 
        showCircle={showGlobalProgress}
        linear={true}
      />
      {showImportAd && <Ad message={getAdMessage()}/>}
      <Overlay 
        show={showGlobalLoading} 
        activeOpacity={0.9}
      />
    </View>
  );
}

export default GlobalProgress;
