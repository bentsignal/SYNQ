import { TouchableOpacity, StyleSheet, Image } from "react-native";
import { useEffect, useState } from "react";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { setAppIcon, getAppIcon } from "expo-icon-handler";
import { getAppIcon as getAppIconImage, getIcon } from "@/src/constants/Logos";
import { adjustLightness } from "@/src/controllers/ColorController";
import { Colors } from "@/src/constants/Colors";
import { usePostHog } from "posthog-react-native";

type AppIconOptionProps = {
  color: any;
  name: string;
  selected: boolean;
  changeSelection: (color: any) => void;
}

export default function AppIconOption({ color, name, selected, changeSelection }: AppIconOptionProps) {

  const { premium } = usePremiumContext();
  const posthog = usePostHog();

  const handlePress = () => {
    if (premium) {
      posthog.capture('app_icon_change', {
        icon: name,
      });
      setAppIcon(getIcon(color));
      changeSelection(getIcon(color));
    }
  }

  return (
    <TouchableOpacity 
      style={Local.option}
      activeOpacity={1}
      onPress={handlePress}
    >
      <Image
        source={getAppIconImage(color)}
        style={[Local.icon, { 
          borderWidth: selected ? 0.5 : 0,
        }]}
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
    borderColor: Colors.text,
  }
});