import { Image } from "react-native";

type TabIconProps = {
  focused: boolean
}

export const HomeIcon = ({
  focused
}: TabIconProps) => {
  const active = '@/assets/icons/home-active.png';
  const inactive = '@/assets/icons/home-inactive.png';
  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={{
        width: 25,
        height: 25
      }}
    />
  )
};

export const LibraryIcon = ({
  focused
}: TabIconProps) => {
  const active = '@/assets/icons/library-active.png';
  const inactive = '@/assets/icons/library-inactive.png'
  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={{
        width: 25,
        height: 25
      }}
    />
  )
};

export const SettingsIcon = ({
  focused
}: TabIconProps) => {
  const active = '@/assets/icons/gear.png';
  const inactive = '@/assets/icons/gear-inactive.png'
  return (
    <Image 
      source={focused ? require(active) : require(inactive)}
      style={{
        width: 25,
        height: 25
      }}
    />
  )
};
