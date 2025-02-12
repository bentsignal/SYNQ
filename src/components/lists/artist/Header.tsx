import { View, Text, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/components/cover/SongListPageCover";
import { PageType } from "@/src/constants/Types";
import { ListStyles } from "../Styles";
import CountAndDuration from "@/src/components/song/CountAndDuration";
import { useEffect, useState } from "react";
import { getSongsFromArtist } from "@/src/controllers/ArtistController";

type ArtistHeaderProps = {
  id: number;
  title: string;
  pageType: PageType; 
}

const ArtistHeader = ({id, title, pageType}: ArtistHeaderProps) => {

  const insets = useSafeAreaInsets();
  const [songCount, setSongCount] = useState(0);

  useEffect(() => {
    const fetchSongCount = async () => {
      const count = await getSongsFromArtist(id);
      setSongCount(count.length);
    }
    fetchSongCount();
  }, [id]);

  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType}/>
      </View>
      <View style={Local.infoWrapper}>
        <Text style={ListStyles.title}>{title}</Text>
        <Text style={ListStyles.sub}>Artist</Text>
        <CountAndDuration songCount={songCount} duration={0}/>
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  infoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  }
});

export default ArtistHeader;