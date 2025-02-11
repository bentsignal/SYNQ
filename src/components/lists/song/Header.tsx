import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/components/cover/SongListPageCover";
import { PageType } from "@/src/constants/Types";
import CountAndDuration from "../../song/CountAndDuration";

type SongListHeaderProps = {
  id: number;
  title: string;
  songCount: number;
  pageType: PageType; 
  duration: number;
}


const SongListHeader = ({id, title, songCount, pageType, duration}: SongListHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType}/>
      </View>
      <Text style={Local.title}>{title}</Text>
      <CountAndDuration songCount={songCount} duration={duration}/>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  title: {
    ...Styles.h3,
    textAlign: 'center',
    color: Colors.text,
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  songCount: {
    ...Styles.description,
    textAlign: 'center',
    fontWeight: '500',
  },
  coverWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  }
});

export default SongListHeader;