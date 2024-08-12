import { TouchableOpacity, View, Text } from "react-native";
import { Styles } from "@/constants/Styles";
import Skeleton from "../Skeleton";

type OptionProps = {
  handler: () => void;
  bgColor: string;
  tier: string;
  price: string;
  loading: boolean;
}

const PremiumOption = ({handler, bgColor, tier, price, loading}: OptionProps) => {
  
  return (
    <View
      style={{
        width: '30%',
        position: 'relative',
      }}
    >
      <Skeleton 
        show={loading}
        styles={{
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