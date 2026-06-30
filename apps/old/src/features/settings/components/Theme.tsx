import { View, ScrollView, Animated, StyleSheet } from "react-native";
import { Themes } from "@/src/constants/Colors";
import ThemeOption from "@/src/features/settings/components/ThemeOption";
import { LinearGradient } from 'expo-linear-gradient';
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useHorizontalFadeScroll } from "@/src/features/settings/hooks/use-horizontal-fade-scroll";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const Theme = () => {

  const { premium } = usePremiumContext();
  const { handleScroll, leftGradientOpacity, rightGradientOpacity } =
    useHorizontalFadeScroll();

  return (
    <View style={{opacity: premium ? 1 : 0.5}}>
      <AnimatedGradient
          style={[Local.gradient, { 
            opacity: leftGradientOpacity,
            left: 0,
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[ 'rgba(24, 24, 24, 1)', 'rgba(24, 24, 24, 0)']}
          pointerEvents={'none'}
        />
      <ScrollView 
        horizontal
        onScroll={handleScroll}
        style={Local.scrollView}
        showsHorizontalScrollIndicator={false}
      >
        {Object.entries(Themes).map(([key, color], index) => (
          <ThemeOption
            color={color}
            name={key}
            key={key}
          />
        ))}
      </ScrollView>
      <AnimatedGradient
        style={[Local.gradient, {
          opacity: rightGradientOpacity,
          right: 0, 
        }]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        colors={['rgba(24, 24, 24, 1)', 'rgba(24, 24, 24, 0)']}
        pointerEvents={'none'}
      />
    </View>
  );

}

const Local = StyleSheet.create({
  gradient: {
    position: 'absolute', 
    top: 0,
    width: 30,
    height: 130, 
    zIndex: 2,
  },
  scrollView: {
    paddingTop: 15,
    paddingBottom: 15,
    maxHeight: 100,
    position: 'relative',
  },
});

export default Theme;
