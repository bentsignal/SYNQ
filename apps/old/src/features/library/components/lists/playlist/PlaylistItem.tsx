import ListCover from "@/src/features/cover/components/ListCover";
import Select from "@/src/shared/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType, PageType, PlaylistType } from "@/src/constants/Types";
import { usePlaylistRow } from "@/src/features/library/hooks/use-playlist-row";
import colors from "@/src/lib/colors";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PlaylistProps = {
  playlist: PlaylistType;
  bg?: string;
};

const PlaylistItem = ({ playlist, bg }: PlaylistProps) => {
  const {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  } = usePlaylistRow(playlist);

  return (
    <TouchableOpacity
      style={[Local.container, { backgroundColor: bg ?? Colors.song }]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <ListCover
        id={playlist.id}
        image={playlist.image ?? fallbackCoverImage}
        type={CoverType.PLAYLIST}
        empty={!playlist.image && !fallbackCoverImage}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{playlist.name}</Text>
        <Text style={Local.count}>
          {playlist.songCount} {playlist.songCount === 1 ? "song" : "songs"}
        </Text>
      </View>
      {playlist.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {playlist.pageType === PageType.ADD && (
        <Select active={selected} handlePress={handleSelect} />
      )}
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    ...Styles.nonSongItem,
  },
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    ...Styles.h5,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,
    fontWeight: "500",
  },
});

export default PlaylistItem;
