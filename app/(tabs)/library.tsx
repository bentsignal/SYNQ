import TrackPlayer, { Event, useTrackPlayerEvents, useActiveTrack, useProgress } from "react-native-track-player";
import { setupPlayer, skipLeft, skipRight, updateQueue, playAd } from "@/lib/controllers/PlayerController";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Notifications from "@/components/notifications/Notifications";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useEffect, useState, useRef } from "react";
import { NotificationType } from "@/constants/Types";
import MiniPlayer from '@/components/player/MiniPlayer';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CFG from "@/constants/Config";
import CategorySelector from "@/components/CategorySelector";
import { Colors } from "@/constants/Colors";
import Playlists from "@/components/library/Playlists";
import Albums from "@/components/library/Albums";
import Artists from "@/components/library/Artists";
import Songs from "@/components/library/Songs";
import Plus from "@/components/Plus";
import { router } from "expo-router";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { usePlaybackContext } from "@/src/context/PlaybackProvider";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import SettingsButton from "@/components/SettingsButton";

const Library = () => {

  const { 
    
    haptic,
    adPlaying, adURL, shouldPlayAd,
    playerInitialized,

    setShowOverlay, 
    setShowNotificationModal,
    setAdPlaying,
    setShouldPlayAd,
    setPlayerInitialized,

    addNotification,
  
  } = useGlobalContext();

  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();
  const { shuffle, loop, sourceType, sourceId } = usePlaybackContext();

  const track = useActiveTrack();
  const { position, duration } = useProgress();
  const previousPosition = useRef(0);
  const timePlayed = useRef(0);

  const [selected, setSelected] = useState(0);

  const checkForAdInterval = 5;

  useEffect(() => {
    const resetTab = () => {
      setSelected(0); 
    }
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    }
  }, []);

  // used to update storage variable that counts 
  // play time. Used to determine if an ad should be played
  const updateTimePlayed = async () => {
    const previouslyPlayed = await AsyncStorage.getItem('timePlayed');
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed = previouslyPlayedInt + checkForAdInterval;
      if (newTimePlayed >= CFG.playAdAfter) {
        await AsyncStorage.setItem('playAd', 'true');
        setShouldPlayAd(true);
      }
      await AsyncStorage.setItem('timePlayed', newTimePlayed.toString());
    }
    else {
      await AsyncStorage.setItem('timePlayed', checkForAdInterval.toString());
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
    if (timeToEnd !== 0 && timeToEnd <= 1) {
      // user has 1 second left in their song and has an ad coming up. skip to ad early
      if (!premium && !adPlaying && shouldPlayAd) {
        playAd(theme, adURL);
      }
      // user has listened to the ad. set should play ad to false
      else if (adPlaying) {
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
    if (timePlayed.current !== 0 && timePlayed.current % checkForAdInterval === 0) {
      updateTimePlayed();
    }
    previousPosition.current = current;

  }, [position]);

  // sets up player
  useEffect(() => {
    
    try {
      if (!playerInitialized) {
        setupPlayer();
        setPlayerInitialized(true);
      }
    }
    catch (error) {
      console.log('error setting up player: ', error);
    }
  }, []);

  // sets ad playing when ad is active
  useEffect(() => {
    if (track?.id === 'ad') {
      setAdPlaying(true);
      if (premium) {
        setAdPlaying(false);
        setShouldPlayAd(false);
        TrackPlayer.skipToNext();
      }
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
              skipRight(shuffle, theme, haptic, sourceType, sourceId, loop);
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
          if (loop && track) {
            updateQueue(track.id, shuffle, theme, sourceType, sourceId);
            skipRight(shuffle, theme, haptic, sourceType, sourceId, loop);
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

  const getBody = () => {
    switch (selected) {
      case 0: return <Songs />
      case 1: return <Playlists />
      case 2: return <Albums />
      case 3: return <Artists />
    }
  }

  const handleCreate = () => {
    switch (selected) {
      case 1: router.push('/playlist/create'); break;
      case 2: router.push('/album/create'); break;
      case 3: router.push('/artist/create'); break;
    }
  }

  return (
    <View style={Styles.body}>
      <PageTitle 
        title="Library"
        rightHandComponent={
          <View style={Local.buttonsContainer}>
            <TouchableOpacity 
              onPress={handleCreate}
              style={{ display: selected === 0 ? 'none' : 'flex' }}
            >
              <Plus />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Image source={require('@/src/assets/icons/gear.png')} style={Local.icon} />
            </TouchableOpacity>
          </View>
        }
      />
      <CategorySelector 
        containerStyle={{
          width: '90%',
        }}
        callback={setSelected}
      />
      <View style={Styles.divider} />
      {getBody()}
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

const Local = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 20,
  },
  icon: {
    height: 25,
    width: 25,
  }
});

export default Library;