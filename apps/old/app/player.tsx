import PlayerCover from "@/src/features/cover/components/PlayerCover";
import Bar from "@/src/shared/components/modals/Bar";
import PlayerActionButtons from "@/src/features/playback/components/PlayerActionButtons";
import PlayerBackground from "@/src/features/playback/components/PlayerBackground";
import PlayerControls from "@/src/features/playback/components/PlayerControls";
import Time from "@/src/features/playback/components/Time";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { usePlayerScreenActions } from "@/src/features/playback/hooks/use-player-screen-actions";
import { usePlayerScreenState } from "@/src/features/playback/hooks/use-player-screen-state";
import { Dimensions, StyleSheet, View } from "react-native";
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
        <View style={Local.infoContainer}>
          <Animated.View style={infoStyle}>
            <SongInfo
              fileName={trackInfo.fileName}
              title={trackInfo.title}
              artist={trackInfo.artist}
              color={Colors.text}
              titleStyles={[Local.title, Local.dropShadow]}
              artistStyles={[Local.artist, Local.dropShadow]}
            />
          </Animated.View>
          <PlayerActionButtons
            onAddToPlaylist={handleAddToPlaylist}
            onMore={handleMore}
          />
        </View>
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
  infoContainer: {
    marginTop: 20,
    width: Dimensions.get("screen").width * 0.9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  artist: {
    color: Colors.text,
    fontWeight: "500",
    fontSize: 16,
    opacity: 0.5,
  },
  dropShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default Player;
