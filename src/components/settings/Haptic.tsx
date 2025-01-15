import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { getDisabledColor } from "@/lib/controllers/ColorController";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "@/src/context/ThemeProvider";

const Haptic = () => {

  const { haptic, setHaptic} = useGlobalContext();
  const { theme } = useThemeContext();

  const toggleHaptic = async () => {
    await AsyncStorage.setItem('haptic', haptic ? 'false' : 'true');
    setHaptic(!haptic);
  }

  return (
    <Switch
      trackColor={{ false: getDisabledColor(theme), true: theme }}
      thumbColor={Colors.text}
      ios_backgroundColor={getDisabledColor(theme)}
      onValueChange={toggleHaptic}
      style={{marginTop: 10, marginBottom: 10}}
      value={haptic}
    />
  );

}

export default Haptic;