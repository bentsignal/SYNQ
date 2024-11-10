import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Notifications from "@/components/notifications/Notifications";
import { useGlobalContext } from "@/context/GlobalProvider";
import DataManager from "@/lib/DataManager";
import { useEffect, useState } from "react";
import SongList from "@/components/song/SongList";
import { SongType, PageType, NotificationType } from "@/constants/Types";
import * as FileSystem from 'expo-file-system';
import MiniPlayer from '@/components/player/MiniPlayer';
import { getSongByResult } from "@/lib/SongManager";
import { setupPlayer, skipLeft, skipRight, updateQueue } from "@/lib/PlayerManager";
import TrackPlayer, { Event, useTrackPlayerEvents, useActiveTrack } from "react-native-track-player";

const Library = () => {

  const { 
    
    numModified, homeState,
    shuffle, theme, haptic,

    setShowOverlay, 
    setShowNotificationModal,

    addNotification,
  
  } = useGlobalContext();

  const track = useActiveTrack();

  const [songs, setSongs] = useState<SongType[]>([]);

  useEffect(() => {
    setupPlayer();
  }, []);

  // link to control center
  useTrackPlayerEvents(
    [
      Event.RemotePlay, Event.RemotePause, 
      Event.RemoteNext, Event.RemotePrevious, 
      Event.RemoteSeek, 
      Event.PlaybackQueueEnded, Event.PlaybackError,
    ],
    (event) => {
      switch (event.type) {
        case Event.RemotePlay:
          TrackPlayer.play();
          break;
        case Event.RemotePause:
          TrackPlayer.pause();
          break;
        case Event.RemoteNext:
          skipRight(shuffle, theme, haptic);
          break;
        case Event.RemotePrevious:
          skipLeft();
          break;
        case Event.RemoteSeek:
          TrackPlayer.seekTo(event.position);
          break;
        case Event.PlaybackQueueEnded:
          if (shuffle && track) {
            updateQueue(track.id, shuffle, theme);
            skipRight(shuffle, theme, haptic);
          }
          break;
        case Event.PlaybackError:
          console.log('playback error: ', event);
          TrackPlayer.reset();
          const name = track?.title || 'Unknown Song';
          addNotification(
            NotificationType.ERROR,
            'Playback Error',
            'Unable to play ' + name,
            'We ran into an issue while trying to play ' + name + '.',
            event.message,
            () => {
              setShowOverlay(true);
              setShowNotificationModal(true);
            }
          )
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
        // for (let i = results.length - 1; i >= 0; i--) {
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