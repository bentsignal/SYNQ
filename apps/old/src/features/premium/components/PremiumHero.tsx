import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import FeatureList from "@/src/features/premium/components/FeatureList";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PremiumHeroProps = {
  logo: ImageSourcePropType;
};

const PremiumHero = ({ logo }: PremiumHeroProps) => {
  return (
    <>
      <View style={Local.imageContainer}>
        <Image
          source={require("@/src/assets/images/premium-bg-downscaled.jpg")}
          style={Local.coverImage}
        />
        <LinearGradient
          style={Local.coverGradient}
          colors={["rgba(20, 20, 20, 0)", "rgba(20, 20, 20, 1)"]}
          pointerEvents={"none"}
        />
      </View>
      <View style={Local.featureListContainer}>
        <View style={Local.featureListWrapper}>
          <FeatureList />
        </View>
      </View>
      <Image source={logo} style={Local.logo} />
      <Text style={[Styles.h2, Local.premiumText]}>Premium</Text>
      <Text style={[Styles.h4, Local.text]}>Ad free. No limits.</Text>
    </>
  );
};

const Local = StyleSheet.create({
  imageContainer: {
    height: "40%",
    width: "100%",
    ...ModalStyles.roundedTop,
  },
  featureListContainer: {
    height: "40%",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 0,
    justifyContent: "center",
  },
  featureListWrapper: {
    height: "50%",
    width: "100%",
  },
  coverImage: {
    height: "100%",
    width: "100%",
    ...ModalStyles.roundedTop,
  },
  coverGradient: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  logo: {
    width: 50,
    height: 50,
    position: "absolute",
    top: -80,
  },
  premiumText: {
    color: Colors.text,
    marginBottom: 15,
  },
  text: {
    color: Colors.text,
  },
});

export default PremiumHero;
