import { Switch } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getDisabledColor } from "@/lib/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Haptic = () => {

  const { haptic, theme, setHaptic} = useGlobalContext();

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