import type { TrackPlayerAdapter } from "./track-player-adapter";
import type { PlaybackNativeCommandPlan } from "./playback-native-command-step-service";

export const runPlaybackNativeCommandPlan = ({
  adapter,
  plan,
  runNativeCommand,
}: {
  adapter: TrackPlayerAdapter;
  plan: PlaybackNativeCommandPlan;
  runNativeCommand: (command: () => Promise<void>) => void;
}) => {
  switch (plan.type) {
    case "noop":
      return;
    case "pause":
      runNativeCommand(() => adapter.pause());
      return;
    case "play":
      runNativeCommand(() =>
        adapter.play(plan.track, {
          activeTrackId: plan.activeTrackId,
          mode: plan.mode,
          queue: plan.queue,
        }),
      );
      return;
    case "resume":
      runNativeCommand(() => adapter.resume());
      return;
    case "seek":
      runNativeCommand(() => adapter.seekTo(plan.position));
      return;
    case "stop":
      runNativeCommand(() => adapter.stop());
      return;
  }
};
