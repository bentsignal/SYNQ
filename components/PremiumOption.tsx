import { TouchableOpacity, View, Text } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import Skeleton from "./Skeleton";

type OptionProps = {
  handler: () => void;
  tier: string;
  price: string;
  loading: boolean;
  selected: boolean;
}

const PremiumOption = ({handler, tier, price, loading, selected}: OptionProps) => {
  
  const { theme } = useGlobalContext();

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
          backgroundColor: selected ? theme : Colors.song,
        }]}
        activeOpacity={1}
        onPress={handler}
      >
        <Text style={[Styles.subCost, {color: selected ? 'black' : Colors.text}]}>{price}</Text>
        <Text style={[Styles.subTier, {color: selected ? 'black' : Colors.text}]}>{tier}</Text>
      </TouchableOpacity>
    </View>
  );
  
}

export default PremiumOption;