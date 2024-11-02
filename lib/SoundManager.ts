import { Audio } from 'expo-av';

export const togglePlayback = async (sound: Audio.Sound | null): Promise<boolean> => {
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

export const jump = async (sound: Audio.Sound | null, newPositionMS: number) => {
  try {
    if (newPositionMS && sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition: number = Number(newPositionMS > 0 ? newPositionMS : 0);
        await sound.setPositionAsync(newPosition);
      }
      else {
        throw new Error('Sound is not loaded');
      }
    }
  }
  catch (error) {
    console.log('Error setting new audio position:', error);
  }

}