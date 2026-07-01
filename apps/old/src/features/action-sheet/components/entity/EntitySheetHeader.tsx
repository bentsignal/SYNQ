import SheetStyles from "@/src/features/action-sheet/components/Styles";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { type CoverType } from "@/src/constants/Types";
import ListCover from "@/src/features/cover/components/ListCover";
import { StyleSheet, Text, View } from "react-native";

type EntitySheetHeaderProps = {
  coverType: CoverType;
  id?: number;
  image?: string;
  subtitle?: string | number | null;
  title?: string | null;
};

export default function EntitySheetHeader({
  coverType,
  id,
  image,
  subtitle,
  title,
}: EntitySheetHeaderProps) {
  return (
    <View style={SheetStyles.infoContainer}>
      <ListCover
        id={id}
        image={image}
        type={coverType}
        propOnLoad={() => {}}
        empty={!image}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{title}</Text>
        {subtitle ? <Text style={Local.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    ...Styles.h4,
    color: Colors.text,
  },
  subtitle: {
    ...Styles.p,
    color: Colors.infoText,
  },
});
