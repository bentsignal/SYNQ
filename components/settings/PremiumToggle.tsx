import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import { getDisabledColor } from "@/lib/controllers/ColorController";
import { useThemeContext } from "@/context/ThemeProvider";
import { usePremiumContext } from "@/context/PremiumProvider";

const PremiumToggle = () => {

  const { premium, setPremium } = usePremiumContext();
  const { theme } = useThemeContext();

  return (
    <Switch 
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      ios_backgroundColor={getDisabledColor(theme)}
      onValueChange={() => setPremium(!premium)}
      value={premium}
      style={{marginTop: 10}}
    />
  );
}

export default PremiumToggle;