import { TouchableOpacity, StyleSheet, Image } from "react-native";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { setAppIcon } from "expo-icon-handler";
import { getAppIcon, getIcon } from "@/src/constants/Logos";

type AppIconOptionProps = {
  color: any;
  key?: any;
}

export default function AppIconOption({ color, key }: AppIconOptionProps) {

  const { premium } = usePremiumContext();

  return (
    <TouchableOpacity 
      style={Local.option}
      activeOpacity={1}
      onPress={() => { if (premium) setAppIcon(getIcon(color)); }}
    >
      <Image
        source={getAppIcon(color)}
        style={Local.icon}
      />
    </TouchableOpacity>
  );
}

const Local = StyleSheet.create({
  option: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 15,
  }
});