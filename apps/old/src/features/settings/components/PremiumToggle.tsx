import { Colors } from "@/src/constants/Colors";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { getDisabledColor } from "@/src/lib/color-utils";
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
