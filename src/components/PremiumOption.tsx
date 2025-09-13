import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { darkenColor } from "../controllers/ColorController";
import Skeleton from "./Skeleton";
import { posthog } from "@/lib/posthog";

type OptionProps = {
  handler: () => void;
  tier: string;
  price: string;
  loading: boolean;
  selected: boolean;
};

const PremiumOption = ({
  handler,
  tier,
  price,
  loading,
  selected,
}: OptionProps) => {
  const { theme } = useThemeContext();
  const darken = darkenColor(theme, 50, 30);

  const Local = StyleSheet.create({
    optionContainer: {
      width: "30%",
      position: "relative",
    },
    subOption: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 10,
      backgroundColor: selected ? theme : Colors.song,
    },
    skeleton: {
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex: 1,
      borderRadius: 10,
    },
    textColor: {
      color: selected ? darken : Colors.text,
    },
    subText: {
      color: selected ? darken : Colors.infoText,
    },
  });

  return (
    <View style={Local.optionContainer}>
      <Skeleton show={loading} styles={Local.skeleton} />
      <TouchableOpacity
        style={Local.subOption}
        activeOpacity={1}
        onPress={() => {
          posthog.capture("premium_option_press", {
            tier: tier,
            price: price,
          });
          handler();
        }}
      >
        <Text style={[Styles.h4, Local.textColor]}>{price}</Text>
        <Text style={[Styles.p, Local.subText]}>{tier}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PremiumOption;
