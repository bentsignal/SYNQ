import ListCover from "@/src/features/cover/components/ListCover";
import Select from "@/src/shared/components/Select";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { ArtistType, CoverType, PageType } from "@/src/constants/Types";
import { useArtistRow } from "@/src/features/library/hooks/use-artist-row";
import colors from "@/src/lib/colors";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ArtistProps = {
  artist: ArtistType;
  allowInteraction?: boolean;
  bg?: string;
};

const ArtistItem = ({ artist, allowInteraction, bg }: ArtistProps) => {
  const {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  } = useArtistRow(artist);

  return (
    <TouchableOpacity
      style={[Local.container, { backgroundColor: bg ?? Colors.song }]}
      activeOpacity={0.8}
      disabled={
        !allowInteraction ||
        !(
          artist.pageType === PageType.LIBRARY ||
          artist.pageType === PageType.ALBUM
        )
      }
      onPress={handlePress}
    >
      <ListCover
        image={artist.image ?? fallbackCoverImage}
        type={CoverType.ARTIST}
        propOnLoad={() => {}}
        empty={!artist.image && !fallbackCoverImage}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{artist.name}</Text>
      </View>
      {allowInteraction && artist.pageType === PageType.LIBRARY && (
        <TouchableOpacity className="py-2 pl-2" onPress={handleMore}>
          <Ellipsis color={colors.foreground} />
        </TouchableOpacity>
      )}
      {allowInteraction && artist.pageType === PageType.ADD && (
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
    ...Styles.h4,
    color: Colors.text,
  },
});

export default ArtistItem;
