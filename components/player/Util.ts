import { Audio } from 'expo-av';

export const togglePlayPause = async (sound: Audio.Sound | null): Promise<void> => {
  if (sound) {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
    else {
      throw new Error('Sound is not loaded');
    }
  }
  else {
    throw new Error('Sound is null');
  }
}