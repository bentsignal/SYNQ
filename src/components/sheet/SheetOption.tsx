import { TouchableOpacity, Text, Image, ImageURISource, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { getDisabledColor } from "@/lib/controllers/ColorController";

type SongOptionProps = {
  icon: ImageURISource;
  text: string;
  show?: boolean;
  handler: () => void;
}

const SheetOption = ({ icon, text, show=true, handler }: SongOptionProps) => {

  return (
    <TouchableOpacity
      style={Local.container}
      activeOpacity={0.9}
      onPress={handler}
      disabled={!show}
    >
      <Image
        source={icon}
        style={[Local.icon, {
          tintColor: show ? Colors.tabInactive : getDisabledColor(Colors.tabInactive),
        }]}
      />
      <Text style={[Styles.h5, {
        color: show ? Colors.text : getDisabledColor(Colors.tabInactive),
      }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

};

const Local = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
    width: 22,
    height: 22,
  },
});

export default SheetOption;