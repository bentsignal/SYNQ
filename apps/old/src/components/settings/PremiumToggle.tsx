import { Colors } from "@/src/constants/Colors";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { getDisabledColor } from "@/src/controllers/ColorController";
import { Switch } from "react-native-gesture-handler";

const PremiumToggle = () => {
  const { premium, setPremium } = usePremiumContext();
  const { theme } = useThemeContext();

  return (
    <Switch
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      onValueChange={() => setPremium(!premium)}
      value={premium}
      style={{ marginTop: 10 }}
    />
  );
};

export default PremiumToggle;
