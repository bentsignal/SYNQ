import { Text, View, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useGlobalContext } from "@/src/context/GlobalProvider";
import CustomButton from '@/src/components/CustomButton';
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Failure() {

  const { haptic } = useGlobalContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (haptic) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
    }
  }, [haptic]);

  return (
    <View style={Styles.body}>
      <View style={Local.container}>
        <Text style={Local.header}>
          ERROR
        </Text>
        <Text style={Styles.infoText}>
          Sorry, something went wrong.
        </Text>
        <View style={Local.animWrapper}>
          <LottieView 
            source={require('@/src/assets/anim/error.json')}
            autoPlay
            loop={false}
            style={Local.anim}
            renderMode={'SOFTWARE'}
          />
        </View>
      </View>
      <View style={[Local.buttonWrapper, { bottom: insets.bottom }]}>
        <CustomButton 
          title='Back'
          background={Colors.text}
          handlePress={() => {
            router.replace('/(tabs)');
          }}
        />
      </View>
    </View>
  )

}


const Local = StyleSheet.create({
  container: {
    ...Styles.main,
    flexGrow: 1
  },
  header: {
    ...Styles.h1,
    color: Colors.text
  },
  animWrapper: {
    height: 100
  },
  anim: {
    flexGrow: 1,
    width: 100
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    position: 'absolute',
    padding: 5,
    bottom: 10
  }
});