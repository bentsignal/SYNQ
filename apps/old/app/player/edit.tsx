import SongSheetHeader from "@/src/features/action-sheet/components/song/SongSheetHeader";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import SongOptions from "@/src/features/action-sheet/components/song/SongOptions";
import { Colors } from "@/src/constants/Colors";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ScrollView, StyleSheet, View } from "react-native";

const PlayerSongEdit = () => {
  const name = "player-song-sheet";

  const { sendHaptic } = useHaptics();

  return (
    <View style={local.container}>
      <Bar />
      <SongSheetHeader />
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
