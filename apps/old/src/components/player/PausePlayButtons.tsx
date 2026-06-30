import { useEffect, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { useHaptics } from "@/src/hooks/use-haptics";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { State, usePlaybackState } from "react-native-track-player";

const PausePlayButtons = ({
  playSize,
  pauseHeight,
  pauseWidth,
  style,
  color,
}: {
  playSize: number;
  pauseHeight: number;
  pauseWidth: number;
  style: object;
  color?: string;
}) => {
  const { sendHaptic } = useHaptics();
  const { togglePlayback: togglePlayerPlayback } = usePlayer();

  const playbackState = usePlaybackState();
  const [currentState, setCurrentState] = useState(
    playbackState.state ?? State.None,
  );
  const [previousState, setPreviousState] = useState(State.Playing);

  useEffect(() => {
    setPreviousState(currentState);
    setCurrentState(playbackState.state ?? State.None);
  }, [playbackState.state]);

  const togglePlayback = async () => {
    try {
      sendHaptic("soft");
      await togglePlayerPlayback(currentState);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const getButton = () => {
    if (
      [State.Paused, State.Ready].includes(currentState) &&
      ![State.Loading, State.Buffering].includes(previousState)
    ) {
      return <PlayButton size={playSize} color={color} />;
    } else {
      return (
        <PauseButton height={pauseHeight} width={pauseWidth} color={color} />
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={togglePlayback}
      style={{ ...style }}
      activeOpacity={0.8}
    >
      {getButton()}
    </TouchableOpacity>
  );
};

export const PauseButton = ({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color?: string;
}) => {
  const Local = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 5,
    },
    pause: {
      borderRadius: 10,
      height: height,
      width: width,
      backgroundColor: color ? color : Colors.text,
    },
  });

  return (
    <View style={Local.container}>
      <View style={Local.pause} />
      <View style={Local.pause} />
    </View>
  );
};

export const PlayButton = ({
  size,
  color,
}: {
  size: number;
  color?: string;
}) => {
  return (
    <Svg
      fill={color ? color : "#FFFFFF"}
      viewBox="0 0 163.861 163.861"
      width={size}
      height={size}
    >
      <Path
        d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275
        c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z"
      />
    </Svg>
  );
};

export default PausePlayButtons;
