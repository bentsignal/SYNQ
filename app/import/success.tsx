import { Text, View, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { replaceColor } from 'lottie-colorify';
import { Styles } from "@/src/constants/Styles";
import { darkenColor } from "@/src/controllers/ColorController";
import { useEffect } from "react";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Success() {

  const { haptic } = useGlobalContext();
  const { theme } = useThemeContext();

  useEffect(() => {
    if (haptic) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    }
  }, [haptic]);
  
  let source = replaceColor('#4173b9', darkenColor(theme, 10, 20), require('@/src/assets/anim/success.json')); // accent
  source = replaceColor('#63a3ff', theme, source); // main

  return (
    <View style={Local.container}>
      <LottieView 
        source={source}
        autoPlay
        loop={false}
        style={{flexGrow: 1, width: 100}}
        renderMode={'SOFTWARE'}
      />
    </View>
  );

}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  }
});
