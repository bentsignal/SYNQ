import { View } from "react-native";
import LottieView from 'lottie-react-native';

type LoadingProps = {
  width: number;
  height: number;
};

const Loading = ({width, height}: LoadingProps) => {

  return (
    <View style={{height: height}}>
      <LottieView 
        source={require('@/assets/anim/loading.json')}
        autoPlay
        loop={true}
        style={{flexGrow: 1, width: width}}
        renderMode={'SOFTWARE'}
      />
    </View>
  );
  
}

export default Loading;