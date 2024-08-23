import { TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeOptionProps = {
  color: string;
  index: number;
}

const ThemeOption = ({ color, index }: ThemeOptionProps) => {
  const { theme, setTheme } = useGlobalContext();
  return (
    <TouchableOpacity 
      style={{
        width: 70,
        height: 70,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: color,
        padding: 10,
        borderWidth: 2,
        borderColor: color === theme ? Colors.text : 'transparent',
      }}
      activeOpacity={.9}
      onPress={() => {
        setTheme(color);
        AsyncStorage.setItem('theme', color);
      }}
    />
  );
}

export default ThemeOption;