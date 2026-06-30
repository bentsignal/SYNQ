import { useEffect, useRef, useState } from "react";
import InfoModal from "@/src/components/modals/InfoModal";
import Notifications from "@/src/components/notifications/Notifications";
import Option from "@/src/components/Option";
import PageTitle from "@/src/components/PageTitle";
import MiniPlayer from "@/src/components/player/MiniPlayer";
import SettingsButton from "@/src/components/SettingsButton";
import { Colors } from "@/src/constants/Colors";
import CFG from "@/src/constants/Config";
import { Styles } from "@/src/constants/Styles";
import { NotificationType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { usePlaybackContext } from "@/src/context/PlaybackProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { playAd } from "@/src/controllers/PlayerController";
import { useIngestStore } from "@/src/features/ingest/hooks/use-ingest";
import usePlayer from "@/src/hooks/usePlayer";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import TrackPlayer, {
  Event,
  useActiveTrack,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";

const Home = () => {
  const {
    setShowInfoModal,
    setLoading,
    setResults,
    setShowImportAd,

    adPlaying,
    adURL,
    shouldPlayAd,

    setShowOverlay,
    setShowNotificationModal,
    setAdPlaying,
    setShouldPlayAd,

    addNotification,
  } = useGlobalContext();

  const { theme } = useThemeContext();
  const { premium } = usePremiumContext();

  const ingestFromFileBrowser = useIngestStore(
    (state) => state.ingestFromFileBrowser,
  );

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

  const checkForAdInterval = 5;

  // sets up player
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

  // write position to storage to restore position on app reload
  useEffect(() => {
    if (position) {
      AsyncStorage.setItem("position", position.toString());
    }
  }, [position]);

  useEffect(() => {
    const initIndex = async () => {
      const index = await TrackPlayer.getActiveTrackIndex();
      if (index !== undefined) {
        setIndex(index);
      }
    };
    initIndex();
  }, []);

  // song finished playing
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

  // sets ad playing when ad is active
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

  // write last track index to storage to restore position on app reload
  useEffect(() => {
    const updateLastTrackIndex = async () => {
      if (track) {
        const index = await TrackPlayer.getActiveTrackIndex();
        if (index !== undefined) {
          await AsyncStorage.setItem("lastTrackIndex", index.toString());
        }
      }
    };
    updateLastTrackIndex();
  }, [track]);

  // used to update storage variable that counts
  // play time. Used to determine if an ad should be played
  const updateTimePlayed = async () => {
    const previouslyPlayed = await AsyncStorage.getItem("timePlayed");
    if (previouslyPlayed !== null) {
      const previouslyPlayedInt = parseInt(previouslyPlayed);
      const newTimePlayed = previouslyPlayedInt + checkForAdInterval;
      if (newTimePlayed >= CFG.playAdAfter) {
        await AsyncStorage.setItem("playAd", "true");
        setShouldPlayAd(true);
      }
      await AsyncStorage.setItem("timePlayed", newTimePlayed.toString());
    } else {
      await AsyncStorage.setItem("timePlayed", checkForAdInterval.toString());
    }
  };

  // only executes function for free users. used to update play time
  // local storage variable that determines if an ad should be played
  useEffect(() => {
    // make sure premium users don't have ad playing
    if (premium && adPlaying) {
      setAdPlaying(false);
      setShouldPlayAd(false);
      TrackPlayer.skipToNext();
      return;
    } else if (premium) return;

    // song is almost over. check if ad should be played
    const timeToEnd = Math.floor(duration) - Math.floor(position);
    if (timeToEnd !== 0 && timeToEnd <= 1) {
      // user has 1 second left in their song and has an ad coming up. skip to ad early
      if (!premium && !adPlaying && shouldPlayAd) {
        playAd(theme, adURL);
      }
      // user has listened to the ad. set should play ad to false
      else if (adPlaying) {
        AsyncStorage.setItem("playAd", "false");
        AsyncStorage.setItem("timePlayed", "0");
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
    if (
      timePlayed.current !== 0 &&
      timePlayed.current % checkForAdInterval === 0
    ) {
      updateTimePlayed();
    }
    previousPosition.current = current;
  }, [position]);

  // link to control center
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

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle
        title="Home"
        infoHandler={() => setShowInfoModal(true)}
        rightHandComponent={<SettingsButton />}
      />
      <ScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        {/* <View style={[Local.content]}>
          <View style={Local.welcomeTitleContainer}>
            <Text style={Local.title}>Welcome to SYNQ</Text>
            <Image source={logo} style={Local.logo} />
          </View>
          <Text style={[Styles.description]}>
            The coolest place to listen to your music! Below, you can import files
            from this device, or from another device on your network. You can then
            modify the metadata of the music files, or listen to them here in the app!
          </Text>
        </View> */}
        <Image
          source={require("@/src/assets/images/homepage.png")}
          style={Local.banner}
        />
        {!premium && (
          <>
            <Text style={[Local.title, Local.content, Local.premiumTitle]}>
              Premium
            </Text>
            <Option
              title="Premium"
              desc={premium ? "Manage your subcription" : "Unlock all features"}
              icon={require("@/src/assets/icons/premium.png")}
              handlePress={() => {
                posthog.capture("check_premium", {
                  premium: premium,
                });
                router.push("/premium");
              }}
              iconTint={theme}
            />
          </>
        )}
        <Text
          style={[
            Local.title,
            Local.content,
            { marginTop: 20, marginBottom: 20 },
          ]}
        >
          Import Music
        </Text>
        <Option
          title="Files"
          desc="Import from your files"
          icon={require("@/src/assets/icons/folder.png")}
          handlePress={() => {
            ingestFromFileBrowser();
          }}
        />
        <Option
          title="Network"
          desc="Import from your computer"
          icon={require("@/src/assets/icons/wifi.png")}
          handlePress={() => {
            setLoading(true);
            posthog.capture("import_wifi");
            router.push("/import/wifi");
            setTimeout(() => {
              setResults([]);
              setShowImportAd(true);
            }, 10);
          }}
        />
      </ScrollView>
      <MiniPlayer />
      <Notifications customStyles={Local.notifications} />
    </View>
  );
};

const Local = StyleSheet.create({
  notifications: {
    position: "absolute",
    bottom: 0,
  },
  scrollView: {
    width: "100%",
  },
  scrollViewContent: {
    alignItems: "center",
  },
  content: {
    width: "90%",
  },
  icon: {
    height: 25,
    width: 25,
  },
  welcomeTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    ...Styles.h3,
    marginVertical: 10,
    color: Colors.text,
  },
  logo: {
    height: 25,
    width: 25,
  },
  premiumTitle: {
    marginBottom: 15,
    marginTop: 20,
  },
  banner: {
    width: "90%",
    height: 100,
    borderRadius: 10,
    marginTop: 5,
  },
});

export default Home;
