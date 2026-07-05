import {
  createAudioPlayer,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";

type PlaybackStatusPlayer = AudioPlayer & {
  addListener: (
    event: "playbackStatusUpdate",
    listener: (status: AudioStatus) => void,
  ) => { remove: () => void };
};

const waitForDuration = (player: AudioPlayer) =>
  new Promise<number>((resolve) => {
    if (Number.isFinite(player.duration) && player.duration > 0) {
      resolve(player.duration);
      return;
    }

    let settled = false;
    const finish = (duration: number) => {
      if (settled) return;
      settled = true;
      subscription.remove();
      clearTimeout(timeout);
      resolve(duration);
    };

    const subscription = (player as PlaybackStatusPlayer).addListener(
      "playbackStatusUpdate",
      (status) => {
        if (Number.isFinite(status.duration) && status.duration > 0) {
          finish(status.duration);
        }
      },
    );
    const timeout = setTimeout(() => {
      finish(Number.isFinite(player.duration) ? player.duration : 0);
    }, 2000);
  });

export const getAudioDurationFromFile = async (filePath: string) => {
  const player = createAudioPlayer({ uri: filePath }, { updateInterval: 250 });
  try {
    const duration = await waitForDuration(player);
    return Math.floor(duration);
  } finally {
    player.remove();
  }
};
