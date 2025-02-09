import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { Text, StyleSheet } from "react-native";

type SongCountProps = {
  songCount: number;
  duration: number;
}

export default function SongCount({songCount, duration}: SongCountProps) {

  const hours = Math.floor(duration / 3600);
  const minutes = Math.ceil(duration / 60) % 60;

  return (
    <Text style={Local.songCount}>
      {songCount} song{songCount === 1 ? '' : 's'}
      {hours > 0 && `, ${hours} hour${hours === 1 ? '' : 's'} `}
      {hours === 0 && minutes > 0 && ', '}
      {minutes > 0 && `${minutes} minute${minutes === 1 ? '' : 's'}`}
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

