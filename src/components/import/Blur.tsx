import { Text, StyleSheet, View } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { BlurView } from "expo-blur";
import CustomButton from "../CustomButton";
import { darkenColor } from "@/src/controllers/ColorController";
import { router } from "expo-router";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { Colors } from "@/src/constants/Colors";
import LinearGradient from "react-native-linear-gradient";

export default function ImportBlur() {  
  const { theme } = useThemeContext();
  return (
    <BlurView style={Local.blur} intensity={10} tint='dark'>
      <View style={Local.premiumMessageContainer}>
        <Text style={Local.premiumMessageText}>
          Import multiple files with <Text style={{color: theme}}>Premium</Text>
        </Text>
        <CustomButton 
          title={'Learn More'}
          buttonWidth={150}
          background={theme}
          disabledColor={darkenColor(theme, 40, 50)}
          opacity={.90}
          handlePress={() => router.push('/premium')}
        />
      </View>
      <View style={Local.gradientContainer}>
        <LinearGradient
          style={Local.gradient}
          colors={['rgba(0, 0, 0, 0)', 'rgba(20, 20, 20, 1)']}
          pointerEvents={'none'}
        />
        <View style={Local.gradientFill} />
      </View>
    </BlurView>
  );
}

const Local = StyleSheet.create({
  blur: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    bottom: 0,
  },
  premiumMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    zIndex: 2,
  },
  premiumMessageText: {
    ...Styles.infoText,
    paddingBottom: 10,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  gradientContainer: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientFill: {
    position: 'absolute',
    flex: 1,
    top: 200,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 20, 1)',
  }
})
