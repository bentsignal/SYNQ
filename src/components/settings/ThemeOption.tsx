import { TouchableOpacity, StyleSheet } from "react-native";
import { memo } from "react";
import { Colors } from "@/src/constants/Colors";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";

type ThemeOptionProps = {
  color: string;
  key?: any;
}

const ThemeOption = ({ color }: ThemeOptionProps) => {

  const { premium } = usePremiumContext();
  const { theme, changeTheme } = useThemeContext();

  return (
    <TouchableOpacity 
      style={[Local.option, { 
        backgroundColor: color,
        borderColor: color === theme ? Colors.text : 'transparent',
      }]}
      activeOpacity={1}
      onPress={() => { if (premium) changeTheme(color); }}
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