import { View, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/src/context/ThemeProvider";

type LoadingProps = {
  width: number;
  height: number;
};

const Loading = ({width, height}: LoadingProps) => {

  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      height: height,
    },
    mask: {
      height: height,
      width: width,
    },
    anim: {
      flexGrow: 1, 
      width: width,
      backgroundColor: 'transparent',
    },
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: theme,
      opacity: 1,
    }
  });

  return (
    <View style={Local.container}>
      <MaskedView style={Local.mask}
        maskElement= {
          <LottieView 
            source={require('@/src/assets/anim/loading.json')}
            autoPlay
            loop={true}
            style={Local.anim}
            renderMode={'SOFTWARE'}
          />
        }
      >
        <View style={Local.overlay}/>
      </MaskedView>
    </View>
  );
  
}

export default Loading;