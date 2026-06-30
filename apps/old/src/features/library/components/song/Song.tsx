import { useCallback, useEffect, useState } from "react";
import Select from "@/src/shared/components/Select";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { PageType, SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import ListCover from "@/src/features/cover/components/list-cover";
import { getImportSongCover } from "@/src/features/import/lib/import-song-edits";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Ellipsis } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const [selected, setSelected] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const displayMetadata = {
    fileName: song.fileName ?? "",
    title: song.title ?? "",
    artist: song.artist ?? "",
    album: song.album ?? "",
  };
  const displayCover =
    song.pageType === PageType.IMPORT ? coverImage : song.artwork;

  const { setEditSong } = useActionSheetContext();
  const { selectEnabled, selectedSongs, setSelectedSongs } =
    useSelectionContext();

  const { sendHaptic } = useHaptics();
  const opacity = useSharedValue(previous ? 0.3 : 1);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  useEffect(() => {
    opacity.value = withTiming(previous ? 0.3 : 1, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [opacity, previous]);

  useEffect(() => {
    setSelected(false);
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled, setSelectedSongs]);

  const loadCover = useCallback(async () => {
    try {
      if (song.pageType === PageType.IMPORT) {
        const cover = await getImportSongCover(song);
        setCoverImage(cover ?? "");
      }
    } catch (error) {
      console.log("error loading song cover:", error);
    }
  }, [song]);

  useEffect(() => {
    if (song.pageType === PageType.IMPORT) {
      loadCover();
    }
  }, [loadCover, song.pageType]);

  let disablePlay = false;
  if (
    song.pageType &&
    [PageType.IMPORT, PageType.QUEUE, PageType.REORDER].includes(song.pageType)
  ) {
    disablePlay = true;
  }

  const toggleSelected = () => {
    const nextSelected = !selected;
    setSelected(nextSelected);

    if (nextSelected && !selectedSongs.includes(song.id)) {
      setSelectedSongs([...selectedSongs, song.id]);
      return;
    }

    if (!nextSelected) {
      setSelectedSongs(selectedSongs.filter((selectedId) => selectedId !== song.id));
    }
  };

  const handleMore = async () => {
    sendHaptic("light");
    setEditSong(song);
    if (song.pageType === PageType.IMPORT) {
      TrueSheet.present("import-song-sheet");
    } else {
      TrueSheet.present("song-sheet");
    }
  };

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
