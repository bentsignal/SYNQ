import { Colors } from "@/src/constants/Colors";
import { Image, StyleSheet } from "react-native";

type TabIconProps = {
  focused: boolean;
};

const Local = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
  },
});

export const HomeIcon = ({ focused }: TabIconProps) => {
  return (
    <Image
      source={require("@/src/assets/icons/home.png")}
      style={[
        Local.icon,
        { tintColor: focused ? Colors.text : Colors.tabInactive },
      ]}
    />
  );
};

export const LibraryIcon = ({ focused }: TabIconProps) => {
  return (
    <Image
      source={require("@/src/assets/icons/library.png")}
      style={[
        Local.icon,
        {
          tintColor: focused ? Colors.text : Colors.tabInactive,
          width: 22,
          height: 22,
        },
      ]}
    />
  );
};
