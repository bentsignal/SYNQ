import { usePremiumContext } from "@/src/context/PremiumProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import { usePlaybackAdActions } from "@/src/features/playback/hooks/use-playback-ad-actions";

type AdGatedPlaybackCommandParams = {
  command: () => Promise<void> | void;
  afterAdStarts?: () => Promise<void> | void;
};

export type AdGatedPlaybackCommandResult =
  | "blocked-by-active-ad"
  | "started-ad"
  | "ran-command";

export const useAdGatedPlaybackCommand = () => {
  const { adPlaying, shouldPlayAd } = usePlaybackAdContext();
  const { premium } = usePremiumContext();
  const { startAdPlayback } = usePlaybackAdActions();

  const runAdGatedPlaybackCommand = async ({
    command,
    afterAdStarts,
  }: AdGatedPlaybackCommandParams): Promise<AdGatedPlaybackCommandResult> => {
    if (adPlaying) {
      return "blocked-by-active-ad";
    }

    if (!premium && shouldPlayAd) {
      await startAdPlayback();
      await afterAdStarts?.();
      return "started-ad";
    }

    await command();
    return "ran-command";
  };

  return { adPlaying, runAdGatedPlaybackCommand };
};
