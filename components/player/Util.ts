import { Audio } from 'expo-av';

export const togglePlayPause = async (sound: Audio.Sound | null): Promise<boolean> => {
  if (sound) {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        return true;
      } else {
        await sound.playAsync();
        return false;
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