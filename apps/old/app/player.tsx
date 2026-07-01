import PlayerCover from "@/src/features/cover/components/PlayerCover";
import Bar from "@/src/shared/components/modals/Bar";
import PlayerBackground from "@/src/features/playback/components/PlayerBackground";
import PlayerControls from "@/src/features/playback/components/PlayerControls";
import PlayerTrackInfo from "@/src/features/playback/components/PlayerTrackInfo";
import Time from "@/src/features/playback/components/Time";
import { usePlayerScreenActions } from "@/src/features/playback/hooks/use-player-screen-actions";
import { usePlayerScreenState } from "@/src/features/playback/hooks/use-player-screen-state";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

const Player = () => {
  const {
    artworkUri,
    backgroundImage,
    containerStyle,
    gradientStyle,
    infoStyle,
    song,
    trackInfo,
  } = usePlayerScreenState();
  const { handleAddToPlaylist, handleMore } = usePlayerScreenActions(song);

  return (
    <Animated.View style={[containerStyle, Local.container]}>
      <PlayerBackground
        backgroundImage={backgroundImage}
        gradientStyle={gradientStyle}
      />
      <View style={Local.container}>
        <Bar />
        <PlayerCover uri={artworkUri} />
        <PlayerTrackInfo
          artist={trackInfo.artist}
          fileName={trackInfo.fileName}
          infoStyle={infoStyle}
          onAddToPlaylist={handleAddToPlaylist}
          onMore={handleMore}
          title={trackInfo.title}
        />
        <Time />
        <PlayerControls />
      </View>
    </Animated.View>
  );
};

const Local = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    zIndex: 2,
  },
});

export default Player;
