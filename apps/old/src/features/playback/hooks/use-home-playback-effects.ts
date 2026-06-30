import { useEffect, useRef, useState } from "react";
import CFG from "@/src/constants/Config";
import { NotificationType } from "@/src/constants/Types";
import { usePlaybackContext } from "@/src/context/PlaybackProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { playAd } from "@/src/controllers/PlayerController";
import { useAppShellContext } from "@/src/features/app-shell/context/AppShellProvider";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { usePlaybackAdContext } from "@/src/features/playback/context/PlaybackAdProvider";
import usePlayer from "@/src/hooks/usePlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer, {
  Event,
  useActiveTrack,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";

const CHECK_FOR_AD_INTERVAL_SECONDS = 5;

export const useHomePlaybackEffects = () => {
  const { setShowOverlay } = useAppShellContext();
  const { addNotification, setShowNotificationModal } =
    useNotificationsContext();
  const { adPlaying, adURL, shouldPlayAd, setAdPlaying, setShouldPlayAd } =
    usePlaybackAdContext();
  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();

  const {
    shuffle,
    loop,
    sourceType,
    sourceId,
    addOffset,
    playerInitialized,
    setPlayerInitialized,
    decrementAddOffset,
    sort,
    order,
    query,
  } = usePlaybackContext();

  const { setupPlayer, skipLeft, skipRight, updateQueue } = usePlayer();
  const track = useActiveTrack();
  const { position, duration } = useProgress();

  const previousPosition = useRef(0);
  const timePlayed = useRef(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (!playerInitialized) {
        setupPlayer();
        setPlayerInitialized(true);
      }
    } catch (error) {
      console.log("error setting up player: ", error);
    }
  }, []);

  useEffect(() => {
    if (position) {
      AsyncStorage.setItem("position", position.toString());
    }
  }, [position]);

  useEffect(() => {
    const initIndex = async () => {
      const activeIndex = await TrackPlayer.getActiveTrackIndex();
      if (activeIndex !== undefined) {
        setIndex(activeIndex);
      }
    };
    initIndex();
  }, []);

  useEffect(() => {
    const checkNewIndex = async () => {
      const newIndex = await TrackPlayer.getActiveTrackIndex();
      if (newIndex === undefined) {
        return;
      }

      if (newIndex !== index) {
        if (newIndex - index === 1 && addOffset > 0) {
          decrementAddOffset();
        }
      }
    };
    checkNewIndex();
  }, [track]);

  useEffect(() => {
    if (track?.id === -2) {
      setAdPlaying(true);
      if (premium) {
        setAdPlaying(false);
        setShouldPlayAd(false);
        TrackPlayer.skipToNext();
      }
    } else {
      setAdPlaying(false);
    }
  }, [track]);

  useEffect(() => {
    const updateLastTrackIndex = async () => {
      if (track) {
        const activeIndex = await TrackPlayer.getActiveTrackIndex();
        if (activeIndex !== undefined) {
          await AsyncStorage.setItem("lastTrackIndex", activeIndex.toString());
        }
      }
    };
    updateLastTrackIndex();
  }, [track]);

  const updateTimePlayed = async () => {
    const previouslyPlayed = await AsyncStorage.getItem("timePlayed");
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed =
        previouslyPlayedInt + CHECK_FOR_AD_INTERVAL_SECONDS;
      if (newTimePlayed >= CFG.playAdAfter) {
        await AsyncStorage.setItem("playAd", "true");
        setShouldPlayAd(true);
      }
      await AsyncStorage.setItem("timePlayed", newTimePlayed.toString());
    } else {
      await AsyncStorage.setItem(
        "timePlayed",
        CHECK_FOR_AD_INTERVAL_SECONDS.toString(),
      );
    }
  };

  useEffect(() => {
    if (premium && adPlaying) {
      setAdPlaying(false);
      setShouldPlayAd(false);
      TrackPlayer.skipToNext();
      return;
    } else if (premium) return;

    const timeToEnd = Math.floor(duration) - Math.floor(position);
    if (timeToEnd !== 0 && timeToEnd <= 1) {
      if (!premium && !adPlaying && shouldPlayAd) {
        playAd(theme, adURL);
      } else if (adPlaying) {
        AsyncStorage.setItem("playAd", "false");
        AsyncStorage.setItem("timePlayed", "0");
        timePlayed.current = 0;
        setShouldPlayAd(false);
      }
    }

    if (adPlaying) return;

    const current = Math.floor(position);
    const difference = Math.abs(current - previousPosition.current);
    if (difference === 1) {
      timePlayed.current += 1;
    }
    if (
      timePlayed.current !== 0 &&
      timePlayed.current % CHECK_FOR_AD_INTERVAL_SECONDS === 0
    ) {
      updateTimePlayed();
    }
    previousPosition.current = current;
  }, [position]);

  useTrackPlayerEvents(
    [
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteNext,
      Event.RemotePrevious,
      Event.RemoteSeek,
      Event.PlaybackQueueEnded,
      Event.PlaybackError,
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
            } else {
              skipRight();
            }
          }
          break;
        case Event.RemotePrevious:
          if (!adPlaying) {
            if (!premium && shouldPlayAd && !adPlaying) {
              setAdPlaying(true);
              playAd(theme, adURL);
            } else {
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
          if (loop && track && sourceType !== null && sourceId !== null) {
            updateQueue(
              track.id,
              shuffle,
              sourceType,
              sourceId,
              sort,
              order,
              query,
            );
            skipRight();
          }
          break;
        case Event.PlaybackError:
          console.log("playback error: ", event);
          TrackPlayer.reset();
          const name = track?.title || "Unknown Song";
          addNotification(
            NotificationType.ERROR,
            "Playback Error",
            "Unable to play " + name,
            "We ran into an issue while trying to play " + name + ".",
            event.message,
            () => {
              setShowOverlay(true);
              setShowNotificationModal(true);
            },
          );
          break;
      }
    },
  );
};
