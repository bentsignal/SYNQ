import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/src/constants/Colors";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { getDisabledColor } from "@/src/controllers/ColorController";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePrivacyContext } from "@/src/context/PrivacyProvider";

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