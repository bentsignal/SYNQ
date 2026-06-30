import { useEffect, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { getAppIcon as getAppIconImage, getIcon } from "@/src/constants/Logos";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { adjustLightness } from "@/src/lib/color-utils";
import { posthog } from "@/src/lib/posthog";
import { getAppIcon, setAppIcon } from "expo-icon-handler";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type AppIconOptionProps = {
  color: any;
  name: string;
  selected: boolean;
  changeSelection: (color: any) => void;
};

export default function AppIconOption({
  color,
  name,
  selected,
  changeSelection,
}: AppIconOptionProps) {
  const { premium } = usePremiumContext();

  const handlePress = () => {
    if (premium) {
      posthog.capture("app_icon_change", {
        icon: name,
      });
      setAppIcon(getIcon(color));
      changeSelection(getIcon(color));
    }
  };

  return (
    <TouchableOpacity
      style={Local.option}
      activeOpacity={1}
      onPress={handlePress}
    >
      <Image
        source={getAppIconImage(color)}
        style={[
          Local.icon,
          {
            borderWidth: selected ? 0.5 : 0,
          },
        ]}
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
  },
});
