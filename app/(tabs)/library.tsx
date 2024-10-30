import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Notifications from "@/components/notifications/Notifications";
import { useGlobalContext } from "@/context/GlobalProvider";
import DataManager from "@/lib/DataManager";
import { useEffect, useState } from "react";
import SongList from "@/components/song/SongList";
import { SongType, PageType } from "@/constants/Types";
import * as FileSystem from 'expo-file-system';
import MiniPlayer from '@/components/player/MiniPlayer';
import { getSongByResult } from "@/lib/SongManager";
import { setupPlayer } from "@/lib/SoundManager";
import TrackPlayer, { Event, useTrackPlayerEvents } from "react-native-track-player";

const Library = () => {

  const { 
    
    numModified, homeState,

    setPaused,
  
  } = useGlobalContext();

  const [songs, setSongs] = useState<SongType[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setupPlayer();
  }, []);

  // link to control center
  useTrackPlayerEvents(
    [Event.RemotePlay, Event.RemotePause, Event.RemoteNext, Event.RemotePrevious, Event.RemoteSeek],
    (event) => {
      switch (event.type) {
        case Event.RemotePlay:
          TrackPlayer.play();
          setPaused(false);
          break;
        case Event.RemotePause:
          TrackPlayer.pause();
          setPaused(true);
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

  useEffect(() => {
    try {
      const db = DataManager.getInstance();
      db.getSongs().then((results) => {
        let songs: SongType[] = [];
        let dir;
        for (let i = 0; i < results.length; i++) {
          dir = `${FileSystem.documentDirectory}library/${results[i].id}`;
          const song = getSongByResult(results[i]);
          songs.push(song);
        }
        setSongs(songs);
      });
    }
    catch (error) {
      console.log(error);
    }
  }, [numModified, homeState]);

  return (
    <View style={[Styles.body]}>
      <SongList 
        songs={songs}
        headerComponent={<PageTitle title="Library"/>}
        pageType={PageType.LIBRARY}
      />
      <MiniPlayer />
      <Notifications  
        customStyles={{
          position: 'absolute',
          bottom: 0,
        }}
      />
    </View>
  );
}

export default Library;