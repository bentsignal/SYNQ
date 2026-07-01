import PlaybackIconToggleButton from "@/src/features/playback/components/PlaybackIconToggleButton";
import { useLoopPlaybackMode } from "@/src/features/playback/hooks/use-loop-playback-mode";

interface LoopButtonProps {
  primary?: string;
  useBG?: boolean;
}

const LoopButton = ({ primary, useBG }: LoopButtonProps) => {
  const { loop, toggleLoop } = useLoopPlaybackMode();

  return (
    <PlaybackIconToggleButton
      active={loop}
      icon={require("@/src/assets/icons/loop.png")}
      onPress={toggleLoop}
      primary={primary}
      useBG={useBG}
    />
  );
};

export default LoopButton;
