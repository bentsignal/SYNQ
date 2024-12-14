import { Text, View, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useGlobalContext } from "@/context/GlobalProvider";
import CustomButton from '@/components/CustomButton';
import { replaceColor } from 'lottie-colorify';
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { darkenColor } from "@/lib/ColorManager";
import { useEffect } from "react";
import { useThemeContext } from "@/context/ThemeProvider";

export const Success = () => {

  const { 
    
    haptic, shouldSaveToLibrary,

    setHomeState,
  
  } = useGlobalContext();

  const { theme } = useThemeContext();

  useEffect(() => {
    if (haptic) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
  }, [haptic]);
  
  let source = replaceColor('#4173b9', darkenColor(theme, 10, 20), require('@/assets/anim/success.json')); // accent
  source = replaceColor('#63a3ff', theme, source); // main

  return (
    <View style={Styles.body}>
      <View style={Styles.main}>
        <LottieView 
          source={source}
          autoPlay
          loop={false}
          style={{flexGrow: 1, width: 100}}
          renderMode={'SOFTWARE'}
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

  useEffect(() => {
    if (haptic) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
    }
  }, [haptic]);

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
            source={require('@/assets/anim/error.json')}
            autoPlay
            loop={false}
            style={Local.anim}
            renderMode={'SOFTWARE'}
          />
        </View>
      </View>
      <View style={Local.buttonWrapper}>
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