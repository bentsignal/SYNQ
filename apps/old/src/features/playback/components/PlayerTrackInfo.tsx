import { Colors } from "@/src/constants/Colors";
import SongInfo from "@/src/features/library/components/song/SongInfo";
import PlayerActionButtons from "@/src/features/playback/components/PlayerActionButtons";
import {
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

type PlayerTrackInfoProps = {
  artist: string;
  fileName: string;
  infoStyle: StyleProp<ViewStyle>;
  onAddToPlaylist: () => void;
  onMore: () => void;
  title: string;
};

const PlayerTrackInfo = ({
  artist,
  fileName,
  infoStyle,
  onAddToPlaylist,
  onMore,
  title,
}: PlayerTrackInfoProps) => {
  return (
    <View style={Local.infoContainer}>
      <Animated.View style={infoStyle}>
        <SongInfo
          fileName={fileName}
          title={title}
          artist={artist}
          color={Colors.text}
          titleStyles={[Local.title, Local.dropShadow]}
          artistStyles={[Local.artist, Local.dropShadow]}
        />
      </Animated.View>
      <PlayerActionButtons
        onAddToPlaylist={onAddToPlaylist}
        onMore={onMore}
      />
    </View>
  );
};

const Local = StyleSheet.create({
  infoContainer: {
    marginTop: 20,
    width: "90%",
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

export default PlayerTrackInfo;
