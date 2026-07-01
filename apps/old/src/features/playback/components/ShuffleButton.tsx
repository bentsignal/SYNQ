import PlaybackIconToggleButton from "@/src/features/playback/components/PlaybackIconToggleButton";
import { useShufflePlaybackMode } from "@/src/features/playback/hooks/use-shuffle-playback-mode";

interface ShuffleButtonProps {
  primary?: string;
  useBG?: boolean;
}

const ShuffleButton = ({ primary, useBG }: ShuffleButtonProps) => {
  const { shuffle, toggleShuffle } = useShufflePlaybackMode();

  return (
    <PlaybackIconToggleButton
      active={shuffle}
      icon={require("@/src/assets/icons/shuffle.png")}
      onPress={toggleShuffle}
      primary={primary}
      useBG={useBG}
    />
  );
};

export default ShuffleButton;
