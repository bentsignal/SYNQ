import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/src/constants/Colors";
import { usePrivacyContext } from "@/src/features/privacy/context/PrivacyProvider";
import { setStoredAnalyticsPreference } from "@/src/features/privacy/lib/analytics-preference-storage-service";
import { getDisabledColor } from "@/src/lib/color-utils";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";

export default function Analytics() {

  const { allowAnalytics, setAllowAnalytics } = usePrivacyContext();
  const { theme } = useThemeContext();

  const toggleAnalytics = async (value: boolean) => {
    setAllowAnalytics(value);
    await setStoredAnalyticsPreference(value);
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
