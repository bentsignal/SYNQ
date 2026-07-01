import ListCover from "@/src/features/cover/components/ListCover";
import Select from "@/src/shared/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { AlbumType, CoverType, PageType } from "@/src/constants/Types";
import { useAlbumRow } from "@/src/features/library/hooks/use-album-row";
import colors from "@/src/lib/colors";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AlbumProps = {
  album: AlbumType;
  allowInteraction?: boolean;
  bg?: string;
};

const AlbumItem = ({ album, allowInteraction, bg }: AlbumProps) => {
  const {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  } = useAlbumRow(album);

  return (
    <TouchableOpacity
      style={[Local.container, { backgroundColor: bg ?? Colors.song }]}
      activeOpacity={0.8}
      disabled={
        !allowInteraction || album.pageType !== PageType.LIBRARY
      }
      onPress={handlePress}
    >
      <ListCover
        image={album.image ?? fallbackCoverImage}
        type={CoverType.ALBUM}
        propOnLoad={() => {}}
        empty={!album.image && !fallbackCoverImage}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name} numberOfLines={1}>
          {album.name}
        </Text>
        <Text style={Local.year} numberOfLines={1}>
          {album.year ?? "Unknown Year"}
        </Text>
      </View>
      {allowInteraction && album.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {allowInteraction && album.pageType === PageType.ADD && (
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
    width: "90%",
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
  year: {
    ...Styles.sub,
    color: Colors.infoText,
    fontWeight: "500",
  },
});

export default AlbumItem;
