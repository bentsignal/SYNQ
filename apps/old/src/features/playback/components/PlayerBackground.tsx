import { Colors } from "@/src/constants/Colors";
import CrossfadeImage from "@/src/features/playback/components/CrossfadeImage";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { Dimensions, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type PlayerBackgroundProps = {
  backgroundImage: string;
  gradientStyle: StyleProp<ViewStyle>;
};

const PlayerBackground = ({
  backgroundImage,
  gradientStyle,
}: PlayerBackgroundProps) => {
  return (
    <>
      <CrossfadeImage
        source={{ uri: backgroundImage }}
        blurRadius={100}
        duration={500}
        style={[
          Local.bg,
          {
            zIndex: 0,
            backgroundColor: Colors.popup,
          },
        ]}
      />
      <AnimatedLinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgb(0, 0, 0)"]}
        style={[
          Local.bg,
          gradientStyle,
          {
            zIndex: 1,
          },
        ]}
      />
    </>
  );
};

const Local = StyleSheet.create({
  bg: {
    ...ModalStyles.roundedTop,
    position: "absolute",
    height: Dimensions.get("screen").height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default PlayerBackground;
