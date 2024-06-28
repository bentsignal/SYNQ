import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LottieView from 'lottie-react-native'

import { useGlobalContext } from "@/context/GlobalProvider"
import Top from "@/components/Top"
import CustomButton from '@/components/CustomButton'
import { Styles } from "@/constants/Styles"
import { Colors } from "@/constants/Colors"

const Failure = () => {
  const {setHomeState} = useGlobalContext();
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <View style={Styles.main}>
        <LottieView 
          source={require('@/assets/anim/success.json')}
          autoPlay
          loop={false}
          style={{flexGrow: 1, width: 100}}
          renderMode={'SOFTWARE'}
          onAnimationFinish={() => {
            setTimeout(() => {
              setHomeState(0);
            }, 1500)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const Success = () => {
  const {setHomeState} = useGlobalContext();
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <View style={[Styles.main, {
        flexGrow: 1
      }]}>
        <Text style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: Colors.text
        }}>
          ERROR
        </Text>
        <Text style={Styles.infoText}>
          Could not export your songs, try again.
        </Text>
        <View
          style={{
            height: 100
          }}
        >
          <LottieView 
            source={require('@/assets/anim/error.json')}
            autoPlay
            loop={false}
            style={{flexGrow: 1, width: 100}}
            renderMode={'SOFTWARE'}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          position: 'absolute',
          padding: 5,
          bottom: 10
        }}
      >
        <CustomButton 
          title='Back'
          background={Colors.text}
          handlePress={() => {
            setHomeState(0)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

export { Success, Failure };