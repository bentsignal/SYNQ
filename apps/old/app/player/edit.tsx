import SongSheetHeader from "@/src/features/action-sheet/components/song/SongSheetHeader";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import SongOptions from "@/src/features/action-sheet/components/song/SongOptions";
import { Colors } from "@/src/constants/Colors";
import { usePlayerSongEditSheet } from "@/src/features/playback/hooks/use-player-song-edit-sheet";
import { ScrollView, StyleSheet, View } from "react-native";

const PlayerSongEdit = () => {
  const name = "player-song-sheet";

  const { handleMomentumScrollBegin } = usePlayerSongEditSheet(name);

  return (
    <View style={local.container}>
      <Bar />
      <SongSheetHeader />
      <ScrollView
        scrollEnabled={false}
        onMomentumScrollBegin={handleMomentumScrollBegin}
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
