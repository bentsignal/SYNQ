import { View } from "react-native";
import LottieView from 'lottie-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";

type LoadingProps = {
  width: number;
  height: number;
};

const Loading = ({width, height}: LoadingProps) => {

  const { theme } = useGlobalContext();

  return (
    <View 
      style={{
        height: height,
      }}
    >
      <MaskedView
        style={{
          height: height,
          width: width,
        }}
        maskElement= {
          <LottieView 
            source={require('@/assets/anim/loading.json')}
            autoPlay
            loop={true}
            style={{
              flexGrow: 1, 
              width: width,
              backgroundColor: 'transparent',
            }}
            renderMode={'SOFTWARE'}
          />
        }
      >
        <View 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: theme,
            opacity: 1,
          }}
        />
      </MaskedView>
      
    </View>
  );
  
}

export default Loading;