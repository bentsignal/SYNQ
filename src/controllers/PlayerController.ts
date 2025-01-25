import TrackPlayer, { useTrackPlayerEvents, Event, Capability, Track } from "react-native-track-player";
import { SongType, SourceType } from "@/src/constants/Types";
import * as FileSystem from "expo-file-system";
import * as Haptics from 'expo-haptics';
import { getFileName } from '@/lib/Util';
import { getAppIcon } from '@/src/constants/Logos';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getPlaylistSongs } from '@/src/controllers/PlaylistController';
import { getSongsFromArtist } from '@/src/controllers/ArtistController';
import { getSongById } from '@/src/controllers/SongController';
import { PageType, SortType } from '@/src/constants/Types';
import { getAlbumCoverFromSong, getSongsFromAlbum } from '@/src/controllers/AlbumController';
import { getAlbumCoverPathFromSong, getSongCover } from '@/src/controllers/ImageController';
import { check } from "@/lib/Util";

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
  try {
    const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
    let coverPath = await getAlbumCoverFromSong(Number(song.id), true);
    if (!check(coverPath)) {
      coverPath = await getSongCover(song.id, true);
    }
    const audioPath = `${libraryPath}/${song.fileName}`;
    return {
      id: song.id,
      url: audioPath,
      description: uuidv4(),
      title: song.title ?? getFileName(audioPath),
      artist: song.artist,
      album: song.album,
      artwork: coverPath ? coverPath : getAppIcon(theme),
    };
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

export const skipRight = async (
  shuffle: boolean,
  theme: string,
  haptic: boolean,
  sourceType: SourceType,
  sourceId: number,
  loop: boolean,
) => {
  try {
    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex >= queue.length-1 && !loop) {
      // no next song, play error haptic feedback
      if (haptic) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    else if (currentIndex !== undefined) {
      // if loop is on, keep queue going infinitely
      if (currentIndex >= queue.length-1 && loop) {
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

export const getNextUp = async (
  currentId: string,
  pagination: number = 100,
  shuffle: boolean = false,
  sourceType: SourceType,
  sourceId: number,
): Promise<SongType[]> => {

  const next: SongType[] = [];
  let songs: SongType[] = [];
  if (sourceType === SourceType.PLAYLIST) {
    songs = await getPlaylistSongs(sourceId, PageType.LIBRARY, SortType.NEWEST);
  }
  else if (sourceType === SourceType.ARTIST) {
    songs = await getSongsFromArtist(sourceId, SortType.NEWEST);
  }
  else if (sourceType === SourceType.ALBUM) {
    songs = await getSongsFromAlbum(sourceId, SortType.OLDEST);
  }
  else {
    return songs;
  }

  try {
    if (shuffle) {
      const cap = pagination > songs.length ? songs.length : pagination;
      for (let i = 0; i < cap; i++) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        const newSong = songs[randomIndex];
        next.push(newSong);
        songs.splice(randomIndex, 1);
      }
    }
    else {
      const currentIndex = songs.findIndex((song: SongType) => song.id === currentId);
      const validSongs = songs.filter((song: SongType, index: number) => index > currentIndex);
      if (validSongs.length === 0) {
        const cap = pagination > songs.length ? songs.length : pagination;
        for (let i = 0; i < cap; i++) {
          const newSong = songs[i];
          next.push(newSong);
        }
      }
      else {
        const cap = pagination > validSongs.length ? validSongs.length : pagination;
        for (let i = 0; i < cap; i++) {
          const newSong = validSongs[i];
          next.push(newSong);
        }
      }
    }
  }
  catch (error) {
    console.log(error);
  }

  return next;

}

export const fetchMoreSongs = async (id: string, shuffle: boolean, sourceType: SourceType, sourceId: number) => {
  try {
    let newSongs = await getNextUp(id, 100, shuffle, sourceType, sourceId);
    if (newSongs.length < 1) {
      newSongs = await getNextUp(id, 100, true, sourceType, sourceId);
    }
    return newSongs;
  }
  catch (error) {
    console.log('error fetching more songs: ', error);
    return [];
  }
}

export const getNextValidSong = async (songs: number[]): Promise<SongType | null> => {
  let foundSong = false;
  let newSong = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  while (!foundSong && attempts < MAX_ATTEMPTS) {
    if (songs.length === 0) {
      throw new Error('No valid songs found in next up');
    }
    const newId = songs.shift();
    if (newId && newId !== -1) {
      newSong = await getSongById(newId);
      if (![null, undefined, -1, '-1'].includes(newSong.id)) {
        foundSong = true;
      }
    }
    attempts++;
  }
  return newSong;
}