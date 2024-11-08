import TrackPlayer, { useTrackPlayerEvents, Event, Capability, Track } from "react-native-track-player";
import { SongType } from "@/constants/Types";
import * as FileSystem from "expo-file-system";
import * as Haptics from 'expo-haptics';
import { getFileName } from '@/lib/Util';
import { getAppIcon } from '@/constants/Logos';
import { getNextUp } from '@/lib/SongManager';

export const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Skip,
      Capability.Stop,
      Capability.SeekTo,
    ],
  })
};

export const getTrackFromSong = async (song: SongType, theme: string): Promise<Track | undefined> => {
  const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
  try {
    const libraryPathExists = await FileSystem.getInfoAsync(libraryPath);
    if (!libraryPathExists.exists) {
      console.log('Library path does not exist:', libraryPath);
      return;
    }
    const contents = await FileSystem.readDirectoryAsync(libraryPath);  
    if (contents.includes(song.name)) {
      let coverExists = false;
      if (contents.includes('cover_full.jpg')) {
        coverExists = true;
      }
      const audioPath = `${libraryPath}/${song.name}`;
      const coverPath = `${libraryPath}/cover_full.jpg`;
      return {
        id: song.id,
        url: audioPath,
        title: song.info?.metadata?.name ? song.info.metadata.name : getFileName(audioPath),
        artist: song.info?.metadata?.artist,
        artwork: coverExists ? coverPath : getAppIcon(theme),
      };
    }
  } catch (error) {
    console.error('Error in audio playback:', error);
  }
}

export const playTrack = async (track: Track): Promise<void> => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  const queue = await TrackPlayer.getQueue();
  // current song is last in queue, add to end and skip to it
  if (currentIndex === queue.length-1) {
    await TrackPlayer.add(track);
    await TrackPlayer.skipToNext();
  }
  // no song is playing
  else if (currentIndex === undefined) {
    await TrackPlayer.add(track);
  }
  // somewhere in the middle of the queue
  else {
    await TrackPlayer.add(track, currentIndex+1);
    await TrackPlayer.skipToNext();
  }
  await TrackPlayer.play();
}

export const updateQueue = async (currentId: string, shuffle: boolean, theme: string): Promise<void> => {
  await TrackPlayer.removeUpcomingTracks();
  const upcoming = await getNextUp(currentId, 1000, shuffle);
  let upcomingTracks: Track[] = [];
  for (let i = 0; i < upcoming.length; i++) {
    const newTrack = await getTrackFromSong(upcoming[i], theme);
    if (newTrack) {
      upcomingTracks.push(newTrack);
    }
  }
  await TrackPlayer.add(upcomingTracks);
}

export const skipLeft = async () => {
  try {
    const progress = await TrackPlayer.getProgress();
    const index = await TrackPlayer.getActiveTrackIndex();
    if (progress.position < 3 && index !== 0) {
      await TrackPlayer.skipToPrevious();
      await TrackPlayer.play();
    }
    else {
      await TrackPlayer.seekTo(0);
    }
  }
  catch (error) {
    console.log('error skipping left: ', error);
  }
}

export const skipRight = async (shuffle: boolean, theme: string, haptic: boolean) => {
  try {
    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex === queue.length-1) {
      if (shuffle) {
        await updateQueue(queue[currentIndex].id, shuffle, theme);
      }
      else {
        console.log('no song next');
        console.log(haptic);
        // no song next, play error haptic feedback
        if (haptic) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    }
    await TrackPlayer.skipToNext();
    await TrackPlayer.play();
  }
  catch (error) {
    console.log('error skipping right: ', error);
  }
}