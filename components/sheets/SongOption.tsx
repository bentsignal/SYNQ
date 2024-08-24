import { TouchableOpacity, Text, Image, ImageURISource } from "react-native";
import { Styles } from "@/constants/Styles";

type SongOptionProps = {
  icon: ImageURISource;
  text: string;
  handler: () => void;
}

const SongOption = ({ icon, text, handler }: SongOptionProps) => {
  return (
    <TouchableOpacity
      style={Styles.songOptionActionContainer}
      activeOpacity={0.9}
      onPress={handler}
    >
      <Image
        source={icon}
        style={Styles.songOptionIcon}
      />
      <Text style={Styles.songOptionActionText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default SongOption;