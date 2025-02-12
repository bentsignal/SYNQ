import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/components/cover/SongListPageCover";
import { PageType } from "@/src/constants/Types";
import CountAndDuration from "../../song/CountAndDuration";
import { ListStyles } from '@/src/components/lists/Styles';

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
      <View style={ListStyles.infoWrapper}>
        <Text style={ListStyles.title}>{title}</Text>
        <CountAndDuration songCount={songCount} duration={duration}/>
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  coverWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  }
});

export default SongListHeader;