import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getDisabledColor } from "@/lib/ColorManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "@/context/ThemeProvider";

const PremiumToggle = () => {

  const { premium, setPremium } = useGlobalContext();
  const { theme } = useThemeContext();

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