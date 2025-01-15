import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import Skeleton from "./Skeleton";
import { useThemeContext } from "@/src/context/ThemeProvider";

type OptionProps = {
  handler: () => void;
  tier: string;
  price: string;
  loading: boolean;
  selected: boolean;
}

const PremiumOption = ({handler, tier, price, loading, selected}: OptionProps) => {
  
  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    optionContainer: {
      width: '30%',
      position: 'relative',
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
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 1,
      borderRadius: 10,
    },
    textColor: {
      color: selected ? 'black' : Colors.text,
    }
  });

  return (
    <View style={Local.optionContainer}>
      <Skeleton 
        show={loading}
        styles={Local.skeleton}
      />
      <TouchableOpacity 
        style={Local.subOption}
        activeOpacity={1}
        onPress={handler}
      >
        <Text style={[Styles.h4, Local.textColor]}>{price}</Text>
        <Text style={[Styles.p, Local.textColor]}>{tier}</Text>
      </TouchableOpacity>
    </View>
  );
  
}

export default PremiumOption;