import Select from "@/src/shared/components/Select";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { PageType, SongType } from "@/src/constants/Types";
import ListCover from "@/src/features/cover/components/list-cover";
import { useSongRow } from "@/src/features/library/hooks/use-song-row";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import Handle from "@/src/features/library/components/lists/Handle";

type SongProps = {
  song: SongType;
  fadeCover: boolean;
  fadeSong: boolean;
  active: boolean;
  previous?: boolean;
  handlePlay: (song: SongType) => Promise<void>;
  draggable?: boolean;
};

export default function Song({
  song,
  fadeCover,
  fadeSong,
  active,
  previous,
  handlePlay,
  draggable,
}: SongProps) {
  const {
    disablePlay,
    displayCover,
    displayMetadata,
    handleMore,
    opacityStyle,
    selected,
    selectEnabled,
    toggleSelected,
  } = useSongRow(song, previous);

  return (
    <Animated.View
      style={[Local.container, opacityStyle]}
    >
      <TouchableOpacity
        style={[
          Local.contentContainer,
          {
            opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6,
          },
        ]}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={() => handlePlay(song)}
      >
        <ListCover
          image={displayCover}
          type="song"
          fadeOnLoad={fadeCover}
          size={50}
        />
        <SongInfo
          fileName={displayMetadata.fileName}
          title={displayMetadata.title}
          artist={displayMetadata.artist}
          album={displayMetadata.album}
          id={song.id}
          isActive={active}
        />
        {selectEnabled && song.pageType !== PageType.QUEUE && !draggable && (
          <Select
            active={selected}
            handlePress={toggleSelected}
          />
        )}

        {!selectEnabled && song.pageType !== PageType.QUEUE && !draggable && (
          <Ellipsis
            onPress={handleMore}
            color={Colors.text}
            style={Local.more}
          />
        )}

        {draggable && <Handle />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const Local = StyleSheet.create({
  container: {
    width: "100%",
  },
  contentContainer: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    marginBottom: 15,
  },
  skeleton: {
    ...Styles.roundedContainer,
    position: "absolute",
    width: "90%",
    height: 90,
    zIndex: 1,
  },
  blur: {
    ...Styles.roundedContainer,
    overflow: "hidden",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    width: "90%",
    height: 60,
    zIndex: 2,
  },
  more: {
    paddingRight: 0,
    paddingVertical: 15,
    paddingLeft: 15,
  },
});
