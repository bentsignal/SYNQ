import { Text, View,} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from 'expo-store-review';
import { useGlobalContext } from "@/context/GlobalProvider";
import Top from "@/components/Top";
import CustomButton from '@/components/CustomButton';
import { replaceColor } from 'lottie-colorify';
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { darkenColor } from "@/lib/ColorManager";

export const Success = () => {

  const { 
    
    theme, haptic,

    setHomeState,
  
  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  if (haptic) {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  }
  
  let source = replaceColor('#4173b9', darkenColor(theme, 10, 20), require('@/assets/anim/success.json')); // accent
  source = replaceColor('#63a3ff', theme, source); // main

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <Top />
      <View style={Styles.main}>
        <LottieView 
          source={source}
          // source={flatten('#ff0000', require('@/assets/anim/success.json'))}
          autoPlay
          loop={false}
          style={{flexGrow: 1, width: 100}}
          renderMode={'SOFTWARE'}
          onAnimationFinish={() => {
            setTimeout(async () => {
              setHomeState(0);
              let countStr = await AsyncStorage.getItem('importCount');
              if (countStr) {
                try {
                  let count = parseInt(countStr);
                  count++;
                  if (count === 10) {
                    try {
                      await StoreReview.isAvailableAsync();
                      await StoreReview.requestReview();
                    }
                    catch (error) {
                      console.log('failed to request app store review');
                    }
                  }
                  await AsyncStorage.setItem('importCount', `${count}`);
                }
                catch(error) {
                  console.log(error);
                }
              }
              else {
                await AsyncStorage.setItem('importCount', '1');
              }
            }, 1500);
          }}
        />
      </View>
    </View>
  );

}

export const Failure = () => {

  const {

    haptic,
    
    setHomeState
  
  } = useGlobalContext();

  const insets = useSafeAreaInsets();

  if (haptic) {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    )
  }

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
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
            setHomeState(0);
          }}
        />
      </View>
    </View>
  )

}