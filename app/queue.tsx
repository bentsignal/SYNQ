import { View, StyleSheet, Text, Dimensions, FlatList } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageTitle from "@/src/components/PageTitle";
import { SkipLeft, SkipRight } from "@/src/components/player/Skip";
import PausePlayButtons from "@/src/components/player/PausePlayButtons";
import Time from "@/src/components/player/Time";
import ShuffleButton from "@/src/components/player/ShuffleButton";
import SongList from "@/src/components/lists/song";
import { useEffect, useState, useRef } from "react";
import { PageType, SongType } from "@/src/constants/Types";
import { getSongById } from "@/src/controllers/SongController";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";
import { check } from "@/lib/Util";
import { useThemeContext } from '@/src/context/ThemeProvider';
import { usePlaybackContext } from "@/src/context/PlaybackProvider";
import Bar from "@/src/components/modals/Bar";
import ModalStyles from "@/src/components/modals/Styles";
import LoopButton from "@/src/components/player/LoopButton";
import playbackBus from "@/src/events/playback";
import { PlaybackBusEvent } from "@/src/events/playback/Events";
import Animated, { useSharedValue, useAnimatedStyle, 
  withTiming, Easing } from "react-native-reanimated";
import { DragEndParams } from "react-native-draggable-flatlist";

const Queue = () => {

  const { shuffle } = usePlaybackContext();
  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);
  const listRef = useRef<any>(null);
  const listOpacity = useSharedValue(0);

  useEffect(() => {
    scrollToIndex();
  }, [track]);

  const scrollToIndex = async (animated: boolean = true) => {
    const index = await TrackPlayer.getActiveTrackIndex();
    if (check(index)) {
      listRef.current?.scrollToIndex({
        index: index,
        animated: animated,
      });
    }
  }

  useEffect(() => {
    loadSongs();
  }, [shuffle]);

  useEffect(() => {
    playbackBus.on(PlaybackBusEvent.QUEUE_UPDATED, loadSongs);
    return () => {
      playbackBus.off(PlaybackBusEvent.QUEUE_UPDATED, loadSongs);
    }
  }, []);

  const loadSongs = async () => {
    const results: SongType[] = [];
    const queue = await TrackPlayer.getQueue();
    try {
      let result: SongType;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].id !== -1) {
          result = await getSongById(queue[i].id);
          result.uuid = queue[i].description;
          results.push(result);
        }
      }
    }
    catch (error) {
      console.log('error loading queue songs to display in list:', error);
    }
    setSongs(results);
    scrollToIndex(false);
    listOpacity.value = withTiming(1, {duration: 500, easing: Easing.inOut(Easing.ease)});
  }

  const listContainerStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  }));

  const onDragEnd = async ({ data, from, to }: DragEndParams<any>) => {
    setSongs(data);
    await TrackPlayer.move(from, to);
  }

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={Local.divider}/>
      <PageTitle title="Now Playing"/>
      <Animated.View style={listContainerStyle}>
        <SongList 
          songs={songs}
          pageType={PageType.QUEUE}
          hideTopGradient={true}
          gradientStart={'rgba(24, 24, 24, 1)'}
          gradientEnd={'rgba(24, 24, 24, 0)'}
          dragRef={listRef}
          footerComponent={<View style={{height: 500}}/>}
          draggable={true}
          onDragEnd={onDragEnd}
        />
      </Animated.View>
      {/* <View style={{flex: 1, width: '100%'}}>
        <AnimatedList />
      </View> */}
      <View style={[Local.footer, {
        paddingBottom: insets.bottom,
      }]}>
        <Time />
        <View style={Local.controlsContainer}>
          <ShuffleButton primary={theme}/>
          <View style={Local.centerControlsContainer}>
            <SkipLeft size={20}/>
            <PausePlayButtons 
              playSize={30}
              pauseHeight={30}
              pauseWidth={9}
              style={Local.pausePlay}
            />
            <SkipRight size={20}/>
          </View>
          <LoopButton primary={theme} useBG={false}/>
        </View>
      </View>
    </View>
  );

}

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  currentlyPlayingContainer: {
    maxWidth: Dimensions.get('window').width * 0.9,
    flexDirection: 'row',
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: Colors.popup,
    borderTopWidth: 1,
    borderTopColor: Colors.popup,
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 0.85,
    gap: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerControlsContainer: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausePlay: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryHeader: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.9,
  },
  divider: {
    height: 10,
  }
});

export default Queue;
