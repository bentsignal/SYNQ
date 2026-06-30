import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { playAd } from "@/src/features/playback/lib/player-track-service";

type AdGatedPlaybackCommandParams = {
  command: () => Promise<void> | void;
  afterAdStarts?: () => Promise<void> | void;
};

export type AdGatedPlaybackCommandResult =
  | "blocked-by-active-ad"
  | "started-ad"
  | "ran-command";

export const useAdGatedPlaybackCommand = () => {
  const { adPlaying, adURL, setAdPlaying, shouldPlayAd } =
    usePlaybackAdContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  const runAdGatedPlaybackCommand = async ({
    command,
    afterAdStarts,
  }: AdGatedPlaybackCommandParams): Promise<AdGatedPlaybackCommandResult> => {
    if (adPlaying) {
      return "blocked-by-active-ad";
    }

    if (!premium && shouldPlayAd) {
      setAdPlaying(true);
      await playAd(theme, adURL);
      await afterAdStarts?.();
      return "started-ad";
    }

    await command();
    return "ran-command";
  };

  return { adPlaying, runAdGatedPlaybackCommand };
};
