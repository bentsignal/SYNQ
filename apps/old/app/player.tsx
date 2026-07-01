import PlayerCover from "@/src/features/cover/components/PlayerCover";
import CrossfadeImage from "@/src/features/playback/components/CrossfadeImage";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import PlayerControls from "@/src/features/playback/components/PlayerControls";
import Time from "@/src/features/playback/components/Time";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { usePlayerScreenActions } from "@/src/features/playback/hooks/use-player-screen-actions";
import { usePlayerScreenState } from "@/src/features/playback/hooks/use-player-screen-state";
import colors from "@/src/lib/colors";
import { CirclePlus, Ellipsis } from "lucide-react-native";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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
      <CrossfadeImage
        source={{ uri: backgroundImage }}
        blurRadius={100}
        duration={500}
        style={[
          Local.bg,
          {
            zIndex: 0,
            backgroundColor: Colors.popup,
          },
        ]}
      />
      <AnimatedLinearGradient
        colors={["rgba(0, 0, 0, 0)", `rgb(0, 0, 0)`]}
        style={[
          Local.bg,
          gradientStyle,
          {
            zIndex: 1,
          },
        ]}
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
          <TouchableOpacity
            onPress={handleAddToPlaylist}
            style={Local.addWrapper}
          >
            <CirclePlus size={25} style={Local.add} />
          </TouchableOpacity>
          <TouchableOpacity className="p-3" onPress={handleMore}>
            <Ellipsis color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <Time />
        <PlayerControls />
      </View>
    </Animated.View>
  );
};

const Local = StyleSheet.create({
  bg: {
    ...ModalStyles.roundedTop,
    position: "absolute",
    height: Dimensions.get("screen").height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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
  add: {
    width: 25,
    height: 25,
    color: Colors.text,
  },
  addWrapper: {
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
  },
  dropShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default Player;
