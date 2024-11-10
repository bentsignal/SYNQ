import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getDisabledColor } from "@/lib/ColorManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PremiumToggle = () => {
  const { theme, premium, setPremium } = useGlobalContext();
  return (
    <Switch 
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      ios_backgroundColor={getDisabledColor(theme)}
      onValueChange={() => setPremium(!premium)}
      value={premium}
    />
  );
}

export default PremiumToggle;