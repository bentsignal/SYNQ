import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import PageTitle from "@/src/components/PageTitle";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { QueueControls } from "@/src/features/playback/components/QueueControls";
import { QueueSongListPanel } from "@/src/features/playback/components/QueueSongListPanel";
import { StyleSheet, View } from "react-native";

const Queue = () => {
  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={Local.divider} />
      <PageTitle title="Now Playing" />
      <QueueSongListPanel />
      {/* <View style={{flex: 1, width: '100%'}}>
        <AnimatedList />
      </View> */}
      <QueueControls />
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  divider: {
    height: 10,
  },
});

export default Queue;
