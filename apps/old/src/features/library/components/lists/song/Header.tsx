import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SongListPageCover from "@/src/features/cover/components/SongListPageCover";
import { PageType } from "@/src/constants/Types";
import CountAndDuration from "@/src/components/song/CountAndDuration";
import { ListStyles } from '@/src/features/library/components/lists/Styles';

type SongListHeaderProps = {
  id: number;
  title: string;
  songCount: number;
  pageType: PageType; 
  duration: number;
  image?: string;
}


const SongListHeader = ({id, title, songCount, pageType, duration, image}: SongListHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType} image={image}/>
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
