import { TouchableOpacity, Text, Image, ImageURISource, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { getDisabledColor } from "@/src/controllers/ColorController";
import { usePremiumContext } from "@/src/context/PremiumProvider";

type SongOptionProps = {
  icon: ImageURISource;
  text: string;
  show?: boolean;
  handler: () => void;
  premiumOnly?: boolean;
}

const SheetOption = ({ icon, text, show=true, handler, premiumOnly=false }: SongOptionProps) => {

  const { premium } = usePremiumContext();

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
      {premiumOnly && !premium && <Text style={Local.premiumText}>Premium</Text>}
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
  premiumText: {
    color: Colors.main,
    ...Styles.h6, 
    marginLeft: 5,
  },
});

export default SheetOption;