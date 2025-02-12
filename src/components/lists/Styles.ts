import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { StyleSheet } from "react-native";

export const ListStyles = StyleSheet.create({
  title: {
    ...Styles.h3,
    textAlign: 'center',
    color: Colors.text,
    width: '100%',
  },
  sub: {
    ...Styles.p,
    textAlign: 'center',
    color: Colors.infoText,
    width: '100%',
  },
  count: {
    marginTop: 2,
    ...Styles.infoText,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.infoText,
    width: '100%',
    minHeight: 15,
  }
});

