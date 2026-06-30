import ListCover from "@/src/features/cover/components/ListCover";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import SongOptions from "@/src/features/action-sheet/components/song/SongOptions";
import SheetStyles from "@/src/features/action-sheet/components/Styles";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { CoverType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useSongSheetCover } from "@/src/features/action-sheet/hooks/use-song-sheet-cover";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ScrollView, StyleSheet, View } from "react-native";

const PlayerSongEdit = () => {
  const name = "player-song-sheet";

  const { editSong } = useActionSheetContext();
  const { sendHaptic } = useHaptics();
  const { coverImage, emptyCover } = useSongSheetCover(editSong);

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
        scrollEnabled={false}
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
