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

const Success = () => {
  const {setHomeState} = useGlobalContext();
  Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  )
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
            setTimeout(async () => {
              setHomeState(0);
              let countStr = await AsyncStorage.getItem('importCount')
              if (countStr) {
                try {
                  let count = parseInt(countStr);
                  count++;
                  if (count === 10) {
                    try {
                      await StoreReview.isAvailableAsync()
                      await StoreReview.requestReview()
                    }
                    catch (error) {
                      console.log('failed to request app store review')
                    }
                  }
                  await AsyncStorage.setItem('importCount', `${count}`)
                }
                catch(error) {
                  console.log(error)
                }
              }
              else {
                await AsyncStorage.setItem('importCount', '1');
              }
            }, 1500)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const Failure = () => {
  const {setHomeState} = useGlobalContext();
  Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error
  )
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
          Sorry, something went wrong.
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