import { useEffect, useState } from "react";
import ListCover from "@/src/components/cover/ListCover";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import SongOptions from "@/src/features/action-sheet/components/song/SongOptions";
import SheetStyles from "@/src/features/action-sheet/components/Styles";
import SongInfo from "@/src/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { CoverType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ScrollView, StyleSheet, View } from "react-native";

const PlayerSongEdit = () => {
  const name = "player-song-sheet";

  const { editSong } = useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => {
    try {
      if (editSong.id) {
        const cover = await getLibrarySongCoverPath(editSong.id);
        if (cover) {
          setCoverImage(cover);
          setEmptyCover(false);
        } else {
          setCoverImage("");
          setEmptyCover(true);
        }
      }
    } catch (error) {
      console.log("error loading song cover:", error);
    }
  };

  useEffect(() => {
    loadCover();
  }, [editSong.id]);

  return (
    <View style={local.container}>
      <Bar />
      <View style={SheetStyles.infoContainer}>
        <ListCover
          image={coverImage}
          type={CoverType.SONG}
          propOnLoad={() => {}}
          empty={emptyCover}
        />
        <SongInfo
          fileName={editSong.fileName}
          title={editSong.title}
          artist={editSong.artist}
          album={editSong.album}
        />
      </View>
      <ScrollView
        scrollEnabled={scrollEnabled}
        onMomentumScrollBegin={(event) => {
          if (event.nativeEvent.contentOffset.y < 0) {
            TrueSheet.dismiss(name);
            sendHaptic("medium");
          }
        }}
      >
        <SongOptions name={name} />
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export default PlayerSongEdit;
