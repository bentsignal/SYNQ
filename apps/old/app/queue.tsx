import { useRef } from "react";
import SongList from "@/src/components/lists/song";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import PageTitle from "@/src/components/PageTitle";
import LoopButton from "@/src/components/player/LoopButton";
import PausePlayButtons from "@/src/components/player/PausePlayButtons";
import ShuffleButton from "@/src/components/player/ShuffleButton";
import { SkipLeft, SkipRight } from "@/src/components/player/Skip";
import Time from "@/src/components/player/Time";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { PageType } from "@/src/constants/Types";
import { usePlaybackQueueDisplay } from "@/src/features/playback/hooks/use-playback-queue-display";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Queue = () => {
  const { theme } = useThemeContext();

  const insets = useSafeAreaInsets();
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
      <View
        style={[
          Local.footer,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Time />
        <View style={Local.controlsContainer}>
          <ShuffleButton primary={theme} />
          <View style={Local.centerControlsContainer}>
            <SkipLeft size={20} />
            <PausePlayButtons
              playSize={30}
              pauseHeight={30}
              pauseWidth={9}
              style={Local.pausePlay}
            />
            <SkipRight size={20} />
          </View>
          <LoopButton primary={theme} useBG={false} />
        </View>
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  currentlyPlayingContainer: {
    maxWidth: Dimensions.get("window").width * 0.9,
    flexDirection: "row",
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    backgroundColor: Colors.popup,
    borderTopWidth: 1,
    borderTopColor: Colors.popup,
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.85,
    gap: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerControlsContainer: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  pausePlay: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryHeader: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.9,
  },
  divider: {
    height: 10,
  },
});

export default Queue;
