import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import SongListPageCover from "@/components/cover/SongListPageCover";
import { PageType } from "@/constants/Types";

type SongListHeaderProps = {
  id: string;
  title: string;
  songCount: number;
  pageType: PageType; 
}

const SongListHeader = ({id, title, songCount, pageType}: SongListHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType}/>
      </View>
      <Text style={Local.title}>{title}</Text>
      <Text style={Local.songCount}>{songCount} songs</Text>
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