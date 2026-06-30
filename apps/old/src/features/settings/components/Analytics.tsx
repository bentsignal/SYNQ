import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/src/constants/Colors";
import { usePrivacyContext } from "@/src/features/privacy/context/PrivacyProvider";
import { getDisabledColor } from "@/src/lib/color-utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";

export default function Analytics() {

  const { allowAnalytics, setAllowAnalytics } = usePrivacyContext();
  const { theme } = useThemeContext();

  const toggleAnalytics = async (value: boolean) => {
    setAllowAnalytics(value);
    await AsyncStorage.setItem('allowAnalytics', value.toString());
  }

  return (
    <Switch
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      ios_backgroundColor={getDisabledColor(theme)}
      onValueChange={toggleAnalytics}
      style={{marginTop: 10, marginBottom: 10}}
      value={allowAnalytics}
    />
  );

}
