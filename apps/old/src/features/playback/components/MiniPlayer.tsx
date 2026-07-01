import ListCover from "@/src/features/cover/components/ListCover";
import CrossfadeImage from "@/src/features/playback/components/CrossfadeImage";
import MiniPlayerControls from "@/src/features/playback/components/MiniPlayerControls";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { CoverType } from "@/src/constants/Types";
import { useMiniPlayerArtwork } from "@/src/features/playback/hooks/use-mini-player-artwork";
import { useMiniPlayerCoverFade } from "@/src/features/playback/hooks/use-mini-player-cover-fade";
import { useOpenPlayer } from "@/src/features/playback/hooks/use-open-player";
import { getFileName } from "@/src/lib/util";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

const MiniPlayer = () => {
  const { backgroundImage, coverImage, emptyCover, track } =
    useMiniPlayerArtwork();
  const { coverStyle } = useMiniPlayerCoverFade(Boolean(track));
  const { openPlayer } = useOpenPlayer();

  const textColor = Colors.text;

  return (
    <View style={Local.wrapper}>
      <TouchableOpacity
        style={[
          Local.container,
          {
            display: track ? "flex" : "none",
            backgroundColor: "transparent",
            overflow: "hidden",
          },
        ]}
        activeOpacity={1}
        onPress={openPlayer}
      >
        <CrossfadeImage
          source={{ uri: backgroundImage }}
          blurRadius={100}
          duration={500}
          style={[Local.container, Local.fadeImage]}
        />
        <Animated.View style={coverStyle}>
          <ListCover
            image={coverImage}
            type={CoverType.SONG}
            propOnLoad={() => {}}
            empty={emptyCover}
          />
        </Animated.View>
        <SongInfo
          fileName={getFileName(track?.url)}
          title={track?.title}
          artist={track?.artist}
          showAlbum={false}
          color={textColor}
          titleStyles={[Local.title, Local.dropShadow]}
          artistStyles={[Local.artist, Local.dropShadow]}
        />
        <MiniPlayerControls color={textColor} />
      </TouchableOpacity>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    ...Styles.roundedContainer,
    position: "absolute",
    bottom: 0,
    height: 80,
    paddingRight: 5,
    paddingLeft: 10,
    marginBottom: 10,
    width: "95%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  fadeImage: {
    zIndex: 0,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 800,
    height: "100%",
    backgroundColor: Colors.popup,
  },
  title: {
    ...Styles.h5,
    color: Colors.text,
  },
  artist: {
    ...Styles.sub,
    color: Colors.text,
  },
  dropShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default MiniPlayer;
