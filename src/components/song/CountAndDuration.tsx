import { getDurationString } from "@/lib/Util";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { Text, StyleSheet } from "react-native";

type CountAndDurationProps = {
  songCount: number;
  duration: number;
}

export default function CountAndDuration({songCount, duration}: CountAndDurationProps) {

  return (
    <Text style={Local.songCount}>
      {songCount && `${songCount} song${songCount === 1 ? '' : 's'}`}
      {duration > 0 && `, ${getDurationString(duration)}`}
    </Text>
  )
}

const Local = StyleSheet.create({
  songCount: {
    marginTop: 2,
    ...Styles.infoText,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.infoText,
    width: '100%',
  },
})

