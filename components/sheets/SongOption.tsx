import { TouchableOpacity, Text, Image, ImageURISource, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

type SongOptionProps = {
  icon: ImageURISource;
  text: string;
  handler: () => void;
}

const SongOption = ({ icon, text, handler }: SongOptionProps) => {

  const Local = StyleSheet.create({
    songOptionActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 5,
      paddingBottom: 5,
      marginBottom: 10,
    },
    textColor: {
      color: Colors.text,
    },
    songOptionIcon: {
      marginRight: 15,
      width: 20,
      height: 20,
      tintColor: Colors.tabInactive,
    },
  });

  return (
    <TouchableOpacity
      style={Local.songOptionActionContainer}
      activeOpacity={0.9}
      onPress={handler}
    >
      <Image
        source={icon}
        style={Local.songOptionIcon}
      />
      <Text style={[Styles.h5, Local.textColor]}>
        {text}
      </Text>
    </TouchableOpacity>
  );


};

export default SongOption;