import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";
import SongInfo from '@/components/song/SongInfo';
import ListCover from "@/components/cover/ListCover";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import PausePlayButtons from "./PausePlayButtons";
import { Colors } from "@/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util";
import { CoverType } from "@/constants/Types";
import { useThemeContext } from "@/context/ThemeProvider";

const MiniPlayer = () => {

  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const Local = StyleSheet.create({
    container: {
      ...Styles.roundedContainer,
      position: 'absolute',
      bottom: 0,
      height: 80,
      paddingRight: 10,
      paddingLeft: 10,
      marginBottom: 10,
      width: '90%',
      backgroundColor: theme,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      display: track ? 'flex' : 'none'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    playPauseButtonWrapper: {
      width: 35,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
    buttonWrapper: {
      paddingTop: 5,
      paddingBottom: 5,
    },
  });

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
      };

      return (
        <SongInfo 
          info={info} 
          name={getFileName(track.url)}
          showAlbum={false}
          color={[''].includes(theme) ? 'black' : Colors.text}
        />
      );
      
    }
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={1}
      onPress={() => router.push('/player')}
    >
      <ListCover 
        id={track?.id} 
        type={CoverType.SONG}
        propOnLoad={() => {}} 
      />
      {getInfo()}
      <View style={Local.buttonContainer}>
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipLeft size={18} color={[''].includes(theme) ? 'black' : Colors.text}/>
        </TouchableOpacity>
        <PausePlayButtons 
          playSize={25}
          pauseHeight={25}
          pauseWidth={7}
          style={Local.playPauseButtonWrapper}
          color={[''].includes(theme) ? 'black' : Colors.text}
        />
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipRight size={18} color={[''].includes(theme) ? 'black' : Colors.text}/>
        </TouchableOpacity>
      </View>
      
    </TouchableOpacity>
  )
}

export default MiniPlayer;