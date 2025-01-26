import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/components/cover/SongListPageCover";
import { PageType } from "@/src/constants/Types";

type AlbumHeaderProps = {
  id: number;
  title: string;
  year?: number;
  pageType: PageType; 
}

const AlbumHeader = ({id, title, year, pageType}: AlbumHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType}/>
      </View>
      <View style={Local.infoWrapper}>
        <Text style={Local.title}>{title}</Text>
        {year && <Text style={Local.year}>{year}</Text>}
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    ...Styles.h3,
    textAlign: 'center',
    color: Colors.text,
    width: '100%',
  },
  infoWrapper: {
    marginTop: 20,
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  year: {
    ...Styles.p,
    textAlign: 'center',
    color: Colors.infoText,
    width: '100%',
  },
  coverWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  }
});

export default AlbumHeader; 