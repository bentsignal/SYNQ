import { Audio } from "expo-av";

export const getAudioDurationFromFile = async (filePath: string) => {
  let sound: Audio.Sound | null = null;
  try {
    const { sound: loadedSound } = await Audio.Sound.createAsync({
      uri: filePath,
    });
    sound = loadedSound;
    const status = await loadedSound.getStatusAsync();
    if (!status.isLoaded) return 0;
    const duration = status.durationMillis ?? 0;
    return Math.floor(duration / 1000);
  } finally {
    if (sound) {
      await sound.unloadAsync();
    }
  }
};
