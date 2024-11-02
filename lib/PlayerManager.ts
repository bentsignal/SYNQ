import TrackPlayer, { useTrackPlayerEvents, Event, Capability, Track } from "react-native-track-player";
import { SongType } from "@/constants/Types";
import * as FileSystem from "expo-file-system";
import { getFileName } from '@/lib/Util';
import { getAppIcon } from '@/constants/Logos';

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