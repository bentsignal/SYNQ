import { Colors } from "@/src/constants/Colors";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { getDisabledColor } from "@/src/controllers/ColorController";
import { usePreferences } from "@/src/stores/preferences";
import { Switch } from "react-native-gesture-handler";

const Haptic = () => {
  const { theme } = useThemeContext();

  const hapticFeedback = usePreferences((state) => state.hapticFeedback);
  const toggleHapticFeedback = usePreferences(
    (state) => state.toggleHapticFeedback,
  );

  return (
    <Switch
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      onValueChange={toggleHapticFeedback}
      style={{ marginTop: 10, marginBottom: 10 }}
      value={hapticFeedback}
    />
  );
};

export default Haptic;
