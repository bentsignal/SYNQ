import { Image, StyleSheet } from "react-native";

type TabIconProps = {
  focused: boolean
}

const Local = StyleSheet.create({
  icon: {
    width: 25,
    height: 25
  }
});

export const HomeIcon = ({
  focused
}: TabIconProps) => {

  const active = '@/src/assets/icons/home-active.png';
  const inactive = '@/src/assets/icons/home-inactive.png';

  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={Local.icon}
    />
  );

};

export const LibraryIcon = ({
  focused
}: TabIconProps) => {
  const active = '@/src/assets/icons/library-active.png';
  const inactive = '@/src/assets/icons/library-inactive.png'
  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={Local.icon}
    />
  )
};

export const SettingsIcon = ({
  focused
}: TabIconProps) => {

  const active = '@/src/assets/icons/gear.png';
  const inactive = '@/src/assets/icons/gear-inactive.png';

  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={Local.icon}
    />
  );

};
