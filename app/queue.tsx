import { View, StyleSheet, Text, Dimensions } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageTitle from "@/components/PageTitle";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import Time from "@/components/player/Time";
import ShuffleButton from "@/components/player/ShuffleButton";
import SongList from "@/components/lists/song";
import { useEffect, useState } from "react";
import { CoverType, PageType, SongType } from "@/constants/Types";
import { getSongById, generateSongKey } from "@/lib/controllers/SongController";
import ListCover from "@/components/cover/ListCover";
import SongInfo from "@/components/song/SongInfo";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util";
import { useThemeContext } from '@/context/ThemeProvider';
import { usePlaybackContext } from "@/context/PlaybackProvider";
import Bar from "@/components/modals/Bar";
import ModalStyles from "@/components/modals/Styles";
import LoopButton from "@/components/player/LoopButton";

const Queue = () => {

  const { shuffle } = usePlaybackContext();
  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);

  useEffect(() => {

    const loadSongs = async () => {
      const results: SongType[] = [];
      const queue = await TrackPlayer.getQueue();
      const current = await TrackPlayer.getActiveTrackIndex();
      let start = 0;
      if (current !== null && current !== undefined) {
        start = current + 1;
      }
      try {
        let result: SongType;
        for (let i = start; i < queue.length; i++) {
          if (queue[i].id !== 'ad') {
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
    }

    loadSongs();

  }, [track, shuffle]);

  const getInfo = () => {
    if (track !== null && track !== undefined) {
      
      const info = {
        name: getFileName(track.url),
        metadata: {
          name: track.title,
          artist: track.artist,
          album: '',
          artwork: track.artwork,
        }
      }
      return (
        <SongInfo 
          info={info} 
          name={getFileName(track.url)}
          showAlbum={false}
        />
      );
    }
  }

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={Local.divider}/>
      <PageTitle title="Now Playing"/>
      <View style={Local.currentlyPlayingContainer}>
        <ListCover 
          id={track?.id}
          type={CoverType.SONG}
          image={track?.artwork}
          propOnLoad={() => {}}
          fade={true}
        />
        {getInfo()}
      </View>
      <Text style={Local.categoryHeader}>Up Next</Text>
      <SongList 
        songs={songs}
        pageType={PageType.QUEUE}
        gradientStart={'rgba(24, 24, 24, 1)'}
        gradientEnd={'rgba(24, 24, 24, 0)'}
      />
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
