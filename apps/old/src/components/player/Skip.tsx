import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import { useHaptics } from "@/src/hooks/use-haptics";
import usePlayer from "@/src/features/playback/hooks/use-player";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PlayButton } from "./PausePlayButtons";

const Shape = ({ size, color }: { size: number; color?: string }) => {
  return (
    <>
      <PlayButton size={size} color={color} />
      <View style={Local.second}>
        <PlayButton size={size} color={color} />
      </View>
    </>
  );
};

export const SkipRight = ({
  size,
  color,
}: {
  size: number;
  color?: string;
}) => {
  const { skipRight } = usePlayer();
  const { sendHaptic } = useHaptics();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={Local.container}
      onPress={async () => {
        await runAdGatedPlaybackCommand({
          command: async () => {
            sendHaptic("light");
            await skipRight();
          },
        });
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

export const SkipLeft = ({ size, color }: { size: number; color?: string }) => {
  const { skipLeft } = usePlayer();
  const { sendHaptic } = useHaptics();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={async () => {
        await runAdGatedPlaybackCommand({
          command: async () => {
            sendHaptic("light");
            await skipLeft();
          },
        });
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
};

const Local = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  flipped: {
    transform: [{ rotate: "180deg" }],
  },
  second: {
    transform: [{ translateX: -5 }],
  },
});
