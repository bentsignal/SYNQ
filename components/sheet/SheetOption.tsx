import { TouchableOpacity, Text, Image, ImageURISource, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { getDisabledColor } from "@/lib/controllers/ColorController";

type SongOptionProps = {
  icon: ImageURISource;
  text: string;
  show?: boolean;
  handler: () => void;
}

const SheetOption = ({ icon, text, show=true, handler }: SongOptionProps) => {

  const Local = StyleSheet.create({
    songOptionActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 5,
      paddingBottom: 5,
      marginBottom: 10,
    },
    textColor: {
      color: show ? Colors.text : getDisabledColor(Colors.tabInactive),
    },
    songOptionIcon: {
      marginRight: 15,
      width: 22,
      height: 22,
      tintColor: show ? Colors.tabInactive : getDisabledColor(Colors.tabInactive),
    },
  });

  return (
    <TouchableOpacity
      style={Local.songOptionActionContainer}
      activeOpacity={0.9}
      onPress={handler}
      disabled={!show}
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

export default SheetOption;