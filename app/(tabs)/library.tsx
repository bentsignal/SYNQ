import TrackPlayer, { Event, useTrackPlayerEvents, useActiveTrack, useProgress } from "react-native-track-player";
import { setupPlayer, skipLeft, skipRight, updateQueue, playAd } from "@/lib/PlayerManager";
import { View } from "react-native";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Notifications from "@/components/notifications/Notifications";
import { useGlobalContext } from "@/context/GlobalProvider";
import DataManager from "@/lib/DataManager";
import { useEffect, useState, useRef } from "react";
import SongList from "@/components/song/SongList";
import { SongType, PageType, NotificationType } from "@/constants/Types";
import * as FileSystem from 'expo-file-system';
import MiniPlayer from '@/components/player/MiniPlayer';
import { getSongByResult } from "@/lib/SongManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CFG from "@/constants/Config";

const Library = () => {

  const { 
    
    numModified, homeState,
    shuffle, theme, haptic,
    adPlaying, premium, adURL, shouldPlayAd,

    setShowOverlay, 
    setShowNotificationModal,
    setAdPlaying,
    setShouldPlayAd,
    addNotification,
  
  } = useGlobalContext();

  const track = useActiveTrack();
  const { position, duration } = useProgress();
  const previousPosition = useRef(0);
  const timePlayed = useRef(0);

  const [songs, setSongs] = useState<SongType[]>([]);

  // used to update storage variable that counts 
  // play time. Used to determine if an ad should be played
  const updateTimePlayed = async () => {
    const previouslyPlayed = await AsyncStorage.getItem('timePlayed');
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed = previouslyPlayedInt + 20;
      if (newTimePlayed >= CFG.playAdAfter) {
        await AsyncStorage.setItem('playAd', 'true');
        setShouldPlayAd(true);
      }
      await AsyncStorage.setItem('timePlayed', newTimePlayed.toString());
    }
    else {
      await AsyncStorage.setItem('timePlayed', '20');
    }
  }

  // only executes function for free users. used to update play time
  // local storage variable that determines if an ad should be played
  useEffect(() => {

    // make sure premium users don't have ad playing
    if (premium && adPlaying) {
      setAdPlaying(false);
      setShouldPlayAd(false);
      TrackPlayer.skipToNext();
      return;
    }
    else if (premium) return;

    // song is almost over. check if ad should be played
    const timeToEnd = Math.floor(duration) - Math.floor(position);
    if (timeToEnd <= 1) {
      // user has 1 second left in their song and has an ad coming up. skip to ad early
      if (!premium && !adPlaying && shouldPlayAd) {
        playAd(theme, adURL);
      }
      // user has listened to the ad. set should play ad to false
      else if (adPlaying) {
        console.log('resetting ad');
        AsyncStorage.setItem('playAd', 'false');
        AsyncStorage.setItem('timePlayed', '0');
        timePlayed.current = 0;
        setShouldPlayAd(false);
      }
    }

    // if we're here, user is non premium. if ad is playing, don't update time played
    if (adPlaying) return;

    // figure out how much time user has been listening to see how soon an ad should be played
    const current = Math.floor(position);
    const difference = Math.abs(current - previousPosition.current);
    if (difference === 1) {
      timePlayed.current += 1;
    }
    if (timePlayed.current !== 0 && timePlayed.current % 20 === 0) {
      updateTimePlayed();
    }
    previousPosition.current = current;

  }, [position])

  // sets up player
  useEffect(() => {
    setupPlayer();
  }, []);

  // sets ad playing when ad is active
  useEffect(() => {
    if (track?.id === 'ad') {
      setAdPlaying(true);
    }
    else {
      setAdPlaying(false);
    }
  }, [track]);

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
          if (!adPlaying) {
            if (!premium && shouldPlayAd && !adPlaying) {
              setAdPlaying(true);
              playAd(theme, adURL);
            }
            else {
              skipRight(shuffle, theme, haptic);
            }
          }
          break;
        case Event.RemotePrevious:
          if (!adPlaying) {
            if (!premium && shouldPlayAd && !adPlaying) {
              setAdPlaying(true);
              playAd(theme, adURL);
            }
            else {
              skipLeft();
            }
          }
          break;
        case Event.RemoteSeek:
          if (!adPlaying) {
            TrackPlayer.seekTo(event.position);
          }
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

  // updates song list when changes are detected
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