import TrackPlayer, { useTrackPlayerEvents, Event, Capability, Track } from "react-native-track-player";
import { SongType, SourceType } from "@/constants/Types";
import * as FileSystem from "expo-file-system";
import * as Haptics from 'expo-haptics';
import { getFileName } from '@/lib/Util';
import { getAppIcon } from '@/constants/Logos';
import { getNextUp } from '@/lib/controllers/SongController';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  // await TrackPlayer.setRate(1.5);
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
        description: song.uuid,
        title: song.info?.metadata?.name ? song.info.metadata.name : getFileName(audioPath),
        artist: song.info?.metadata?.artist,
        artwork: coverExists ? coverPath : getAppIcon(theme),
      };
    }
  } catch (error) {
    console.error('Error in audio playback:', error);
  }
}

export const playAd = async (theme: string, adURL: string) => {
  const adTrack = {
    id: 'ad',
    url: adURL,
    title: 'Premium Ad',
    artist: 'SYNQ',
    artwork: getAppIcon(theme),
  }
  await playTrack(adTrack);
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

export const updateQueue = async (
  currentId: string,
  shuffle: boolean,
  theme: string,
  sourceType: SourceType,
  sourceId: number,
): Promise<void> => {
  await TrackPlayer.removeUpcomingTracks();
  const upcoming = await getNextUp(currentId, 1000, shuffle, sourceType, sourceId);
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
    if (progress.position < 3 && index !== 0 && index !== undefined) {
      let nextIndex = index - 1;
      let nextTrack = await TrackPlayer.getTrack(nextIndex);
      while (nextTrack?.id === 'ad' && nextIndex >= 0) {
        nextIndex--;
        nextTrack = await TrackPlayer.getTrack(nextIndex);
      }
      await TrackPlayer.skip(nextIndex);
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

export const skipRight = async (shuffle: boolean, theme: string, haptic: boolean, sourceType: SourceType, sourceId: number) => {
  try {
    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex >= queue.length-1 && !shuffle) {
      // no next song, play error haptic feedback
      if (haptic) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    else if (currentIndex !== undefined) {
      // if shuffle is on, keep queue going infinitely
      if (currentIndex >= queue.length-1 && shuffle) {
        await updateQueue(queue[currentIndex].id, shuffle, theme, sourceType, sourceId);
      }
      let nextIndex = currentIndex + 1;
      let nextTrack = await TrackPlayer.getTrack(nextIndex);
      while (nextTrack?.id === 'ad' && nextIndex < queue.length) {
        nextIndex++;
        nextTrack = await TrackPlayer.getTrack(nextIndex);
      }
      await TrackPlayer.skip(nextIndex);
      await TrackPlayer.play();
    }
  }
  catch (error) {
    console.log('error skipping right: ', error);
  }
}

export const addToQueue = async (track: Track) => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentIndex !== undefined) {
    await TrackPlayer.add(track, currentIndex+1);
  }
  // TODO: Figure out how to queue songs when no song is playing
  // else {
  //   await TrackPlayer.add(newTrack);
  // }
}

export const getTrackArtwork = (track: Track) => {
  if (typeof track?.artwork === 'string') {
    return track?.artwork;
  }
  else {
    return 'transparent';
  }
}