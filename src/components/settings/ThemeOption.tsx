import { TouchableOpacity, StyleSheet } from "react-native";
import { memo } from "react";
import { Colors } from "@/src/constants/Colors";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePostHog } from "posthog-react-native";

type ThemeOptionProps = {
  color: string;
  name: string;
}

const ThemeOption = ({ color, name }: ThemeOptionProps) => {

  const { premium } = usePremiumContext();
  const { theme, changeTheme } = useThemeContext();
  const posthog = usePostHog();

  const handleChange = () => {
    if (!premium) {
      return;
    }
    posthog.capture('theme_change', {
      theme: name,
    });
    changeTheme(color);
  }

  return (
    <TouchableOpacity 
      style={[Local.option, { 
        backgroundColor: color,
        borderColor: color === theme ? Colors.text : 'transparent',
      }]}
      activeOpacity={1}
      onPress={handleChange}
    />
  );
}

const Local = StyleSheet.create({
  option: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginRight: 10,
    padding: 10,
    borderWidth: 2,
  }
});

export default ThemeOption;