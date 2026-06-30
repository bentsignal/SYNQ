import { StyleSheet, Text, View } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/features/cover/components/SongListPageCover";
import { PageType } from "@/src/constants/Types";
import { ListStyles } from "../Styles";
import CountAndDuration from "@/src/components/song/CountAndDuration";

type ArtistHeaderProps = {
  id: number;
  title: string;
  pageType: PageType;
  songCount?: number;
  image?: string;
};

const ArtistHeader = ({
  id,
  title,
  pageType,
  songCount = 0,
  image,
}: ArtistHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[Local.container, { paddingTop: insets.top }]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType} image={image} />
      </View>
      <View style={ListStyles.infoWrapper}>
        <Text style={ListStyles.title}>{title}</Text>
        <Text style={ListStyles.sub}>Artist</Text>
        <CountAndDuration songCount={songCount} duration={0} />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  coverWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});

export default ArtistHeader;
