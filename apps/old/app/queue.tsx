import { useRef } from "react";
import SongList from "@/src/components/lists/song";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import PageTitle from "@/src/components/PageTitle";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import { QueueControls } from "@/src/features/playback/components/QueueControls";
import { usePlaybackQueueDisplay } from "@/src/features/playback/hooks/use-playback-queue-display";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

const Queue = () => {
  const listRef = useRef<any>(null);
  const { listContainerStyle, onDragEnd, songs } = usePlaybackQueueDisplay({
    listRef,
  });

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={Local.divider} />
      <PageTitle title="Now Playing" />
      <Animated.View style={listContainerStyle}>
        <SongList
          songs={songs}
          pageType={PageType.QUEUE}
          hideTopGradient={true}
          gradientStart={"rgba(24, 24, 24, 1)"}
          gradientEnd={"rgba(24, 24, 24, 0)"}
          dragRef={listRef}
          footerComponent={<View style={{ height: 500 }} />}
          draggable={true}
          onDragEnd={onDragEnd}
        />
      </Animated.View>
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
