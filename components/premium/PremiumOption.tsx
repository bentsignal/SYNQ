import { TouchableOpacity, View, Text } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

type OptionProps = {
  handler: () => void;
  bgColor: string;
  tier: string;
  price: string;
  skeleton: boolean;
}

const PremiumOption = ({handler, bgColor, tier, price, skeleton}: OptionProps) => {
  return (
    <>
      <TouchableOpacity 
        style={[Styles.subOption, {
          backgroundColor: bgColor,
        }]}
        activeOpacity={1}
        onPress={handler}
      >
        <Text style={Styles.subTier}>{tier}</Text>
        <Text style={Styles.subCost}>{price}</Text>
      </TouchableOpacity>
    </>
  );
}

export default PremiumOption;