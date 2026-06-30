import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import { getDisabledColor } from "@/src/lib/color-utils";
import { LucideIcon } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type SongOptionProps = {
  icon: LucideIcon;
  text: string;
  show?: boolean;
  handler: () => void;
  premiumOnly?: boolean;
};

const SheetOption = ({
  icon,
  text,
  show = true,
  handler,
  premiumOnly = false,
}: SongOptionProps) => {
  const { premium } = usePremiumContext();

  const IconComponent = icon as LucideIcon;

  return (
    <TouchableOpacity
      style={Local.container}
      activeOpacity={0.9}
      onPress={handler}
      disabled={!show}
    >
      <IconComponent
        size={22}
        color={show ? Colors.tabInactive : getDisabledColor(Colors.tabInactive)}
        style={Local.icon}
      />
      <Text
        style={[
          Styles.h5,
          {
            color: show ? Colors.text : getDisabledColor(Colors.tabInactive),
          },
        ]}
      >
        {text}
      </Text>
      {premiumOnly && !premium && (
        <Text style={Local.premiumText}>Premium</Text>
      )}
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
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
