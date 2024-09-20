import { TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLogo, getIcon } from "@/constants/Logos";
import { setAppIcon } from "expo-icon-handler";

type ThemeOptionProps = {
  name: string;
  color: string;
  index: number;
}

const ThemeOption = ({ name, color, index }: ThemeOptionProps) => {

  const { 

    theme, premium, 

    setTheme, setLogo,
  
  } = useGlobalContext();

  const Local = StyleSheet.create({
    option: {
      width: 70,
      height: 70,
      borderRadius: 100,
      marginRight: 10,
      backgroundColor: color,
      padding: 10,
      borderWidth: 2,
      borderColor: color === theme ? Colors.text : 'transparent',
    }
  });

  return (
    <TouchableOpacity 
      style={Local.option}
      activeOpacity={.9}
      onPress={() => {
        if (premium) {
          setTheme(color);
          setLogo(getLogo(name));
          const success = setAppIcon(getIcon(name));
          AsyncStorage.setItem('theme', color);
        }
      }}
    />
  );
}

export default ThemeOption;