import TrackPlayer, { Capability, Track } from "react-native-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlaybackContext } from "../context/PlaybackProvider";
import { check } from "@/lib/Util";
import { PageType, SongType, SortOrder, SortType, SourceType } from "../constants/Types";
import * as Haptics from 'expo-haptics';
import { PlaybackBusEvent } from "../events/playback/Events";
import playbackBus from "../events/playback";
import { getTrackFromSong } from "../controllers/PlayerController";
import { getPlaylistSongs } from "../controllers/PlaylistController";
import { getSongsFromArtist } from "../controllers/ArtistController";
import { getSongsFromAlbum } from "../controllers/AlbumController";
import { useThemeContext } from "../context/ThemeProvider";
import { useGlobalContext } from "../context/GlobalProvider";

export default function usePlayer () {

  const { setShuffle, setLoop, 
    setSourceType, setSourceId,
    addOffset, setAddOffset,
    sourceType, sourceId,
    shuffle, loop,
    incrementAddOffset, decrementAddOffset,
    resetAddOffset,
    sort, order, query,
  } = usePlaybackContext();

  const { theme } = useThemeContext();
  const { haptic } = useGlobalContext();

  const setupPlayer = async () => {

    await TrackPlayer.setupPlayer();

    // restore shuffle
    const shuffle = await AsyncStorage.getItem('shuffle');
    if (check(shuffle)) {
      setShuffle(shuffle === 'true');
    }

    // restore loop
    const loop = await AsyncStorage.getItem('loop');
    if (check(loop)) {
      setLoop(loop === 'true');
    }

    // restore source type
    const sourceType = await AsyncStorage.getItem('sourceType');
    if (check(sourceType)) {
      setSourceType(Number(sourceType));
    }

    // restore source id
    const sourceId = await AsyncStorage.getItem('sourceId');
    if (check(sourceId)) {
      setSourceId(Number(sourceId));
    }
  
    // restore queue
    const queue = await AsyncStorage.getItem('queue');
    if (queue) {
      await TrackPlayer.setQueue(JSON.parse(queue));
    }
  
    // jump to track
    const lastTrackIndex = await AsyncStorage.getItem('lastTrackIndex');
    if (lastTrackIndex) {
      const index = Number(lastTrackIndex);
      await TrackPlayer.skip(index);
      if (index > 10) {
        await TrackPlayer.remove(Array.from({ length: index - 10 }, (_, i) => i + 1));
      }
    }

    // restore position
    const position = await AsyncStorage.getItem('position');
    if (position) {
      await TrackPlayer.seekTo(Number(position));
    }

    // restore add offset
    const addOffset = await AsyncStorage.getItem('addOffset');
    if (addOffset) {
      setAddOffset(Number(addOffset));
    }

    await TrackPlayer.pause();

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
    });
    
  };

  const addToQueue = async (track: Track) => {
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex !== undefined) {
      await TrackPlayer.add(track, currentIndex+addOffset+1);
      await incrementAddOffset();
    }
    const queue = await TrackPlayer.getQueue();
    await AsyncStorage.setItem('queue', JSON.stringify(queue));
  }

  const skipRight = async () => {
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
          await updateQueue(
            queue[currentIndex].id, 
            shuffle, 
            sourceType, 
            sourceId,
            sort,
            order,
            query
          );
        }
        let nextIndex = currentIndex + 1;
        let nextTrack = await TrackPlayer.getTrack(nextIndex);
        while (nextTrack?.id === -1 && nextIndex < queue.length) {
          nextIndex++;
          nextTrack = await TrackPlayer.getTrack(nextIndex);
        }
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
      }
      await decrementAddOffset();
    }
    catch (error) {
      console.log('error skipping right: ', error);
    }
  }

  const skipLeft = async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      const index = await TrackPlayer.getActiveTrackIndex();
      if (progress.position < 3 && index !== 0 && index !== undefined) {
        let nextIndex = index - 1;
        let nextTrack = await TrackPlayer.getTrack(nextIndex);
        while (nextTrack?.id === -1 && nextIndex >= 0) {
          nextIndex--;
          nextTrack = await TrackPlayer.getTrack(nextIndex);
        }
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
        if (addOffset > 0) await incrementAddOffset();
      }
      else {
        await TrackPlayer.seekTo(0);
      }
    }
    catch (error) {
      console.log('error skipping left: ', error);
    }
  }

  const updateQueue = async (
    currentId: number, 
    shuffleValue: boolean,
    sourceTypeValue: SourceType,
    sourceIdValue: number,
    sort?: SortType,
    order?: SortOrder,
    query?: string,
  ) => {
    await TrackPlayer.removeUpcomingTracks();
    const upcoming = await getNextUp(
      currentId, 100, 
      shuffleValue, 
      sourceTypeValue, 
      sourceIdValue, 
      sort, 
      order,
      query
    );
    let upcomingTracks: Track[] = [];
    for (let i = 0; i < upcoming.length; i++) {
      const newTrack = await getTrackFromSong(upcoming[i], theme);
      if (newTrack) {
        upcomingTracks.push(newTrack);
      }
    }
    await TrackPlayer.add(upcomingTracks);
    playbackBus.emit(PlaybackBusEvent.QUEUE_UPDATED);
    const queue = await TrackPlayer.getQueue();
    await AsyncStorage.setItem('queue', JSON.stringify(queue));
    await resetAddOffset();
  }

  const getNextUp = async (
    currentId: number,
    pagination: number = 100,
    shuffleValue: boolean,
    sourceTypeValue: SourceType,
    sourceIdValue: number,
    sort?: SortType,
    order?: SortOrder,
    query?: string,
  ): Promise<SongType[]> => {
  
    const next: SongType[] = [];
    let songs: SongType[] = [];
    if (sourceTypeValue === SourceType.PLAYLIST) {
      songs = await getPlaylistSongs(sourceIdValue, PageType.LIBRARY, sort, order, query);
    }
    else if (sourceTypeValue === SourceType.ARTIST) {
      songs = await getSongsFromArtist(sourceIdValue, sort, order, query);
    }
    else if (sourceTypeValue === SourceType.ALBUM) {
      songs = await getSongsFromAlbum(sourceIdValue, sort, order, query);
    }
    else {
      return songs;
    }
  
    try {
      if (shuffleValue) {
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

  return {
    setupPlayer,
    addToQueue,
    skipRight,
    skipLeft,
    updateQueue,
  };

}