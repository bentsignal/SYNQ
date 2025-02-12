import { Audio } from 'expo-av';

export const loadAudio = async (audioUri) => {

  let sound: Audio.Sound | null = null;

  try {
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }
    const { sound: loadedSound } = await Audio.Sound.createAsync({ uri: audioUri });
    sound = loadedSound;
    const status = await loadedSound.getStatusAsync();
    if (!status.isLoaded) return 0;
    return Math.floor(status.durationMillis / 1000);
  } catch (error) {
    console.error('Error loading audio:', error);
    return 0;
  }
  finally {
    await unloadAudio(sound);
  }
};

export const unloadAudio = async (sound: Audio.Sound | null) => {
  if (sound) {
    try {
      await sound.unloadAsync();
      sound = null;
    } catch (error) {
      console.error("Error unloading audio:", error);
    }
  }
};