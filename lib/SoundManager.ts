import { Audio } from 'expo-av';
import TrackPlayer, { useTrackPlayerEvents, Event, Capability } from "react-native-track-player";

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

// initialize the player
export const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
      Capability.SeekTo,
    ],
  })
}

// link to device control center
export const useControlCenterEvents = async () => {
  useTrackPlayerEvents(
    [Event.RemotePlay, Event.RemotePause, Event.RemoteNext, Event.RemotePrevious, Event.RemoteSeek],
    (event) => {
      switch (event.type) {
        case Event.RemotePlay:
          TrackPlayer.play();
          break;
        case Event.RemotePause:
          TrackPlayer.pause();
          break;
        case Event.RemoteNext:
          TrackPlayer.skipToNext();
          break;
        case Event.RemotePrevious:
          TrackPlayer.skipToPrevious();
          break;
        case Event.RemoteSeek:
          TrackPlayer.seekTo(event.position);
          break;
      }
    }
  );
}