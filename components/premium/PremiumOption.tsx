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
    <View
      style={{
        width: '30%',
        position: 'relative',
      }}
    >
      <View 
        style={{
          display: skeleton ? 'flex' : 'none',
          backgroundColor: 'red',
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
          borderRadius: 10,
        }}
      />
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
    </View>
  );
}

export default PremiumOption;