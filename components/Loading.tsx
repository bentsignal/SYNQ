import { Text, View, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LottieView from 'lottie-react-native'
import * as Haptics from 'expo-haptics';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from 'expo-store-review'

import { useGlobalContext } from "@/context/GlobalProvider"
import Top from "@/components/Top"
import CustomButton from '@/components/CustomButton'
import { Styles } from "@/constants/Styles"
import { Colors } from "@/constants/Colors"

type LoadingProps = {
  width: number;
  height: number;
}

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
  )
}

export default Loading;