import { Colors } from "@/src/constants/Colors";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { getDisabledColor } from "@/src/lib/color-utils";
import { useHapticStore } from "@/src/hooks/use-haptics";
import { Switch } from "react-native-gesture-handler";

const Haptic = () => {
  const { theme } = useThemeContext();

  const hapticFeedbackEnabled = useHapticStore(
    (state) => state.hapticFeedbackEnabled,
  );
  const toggleHapticFeedback = useHapticStore(
    (state) => state.toggleHapticFeedback,
  );

  return (
    <Switch
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      onValueChange={toggleHapticFeedback}
      style={{ marginTop: 10, marginBottom: 10 }}
      value={hapticFeedbackEnabled}
    />
  );
};

export default Haptic;
