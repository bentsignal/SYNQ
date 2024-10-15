import { View, StyleSheet, Text, Dimensions } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Bar from "@/components/modals/Bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageTitle from "@/components/PageTitle";
import { ScrollView } from "react-native";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import CloseButton from "@/components/CloseButton";
import { router } from "expo-router";
import Time from "@/components/player/Time";
import ShuffleButton from "@/components/player/ShuffleButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import SongList from "@/components/song/SongList";
import { useEffect, useState } from "react";
import { SongType } from "@/constants/Types";
import { getSongById } from "@/lib/SongManager";
import { ListCover } from "@/components/song/Cover";
import SongInfo from "@/components/song/SongInfo";


const Queue = () => {

  const { 
    
    nextUp, queue, songPlaying,
  
  } = useGlobalContext();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);

  const Local = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: insets.top + 20,
    },
    currentlyPlayingContainer: {
      maxWidth: Dimensions.get('window').width * 0.9,
      flexDirection: 'row',
      paddingBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      backgroundColor: Colors.footer,
      borderTopWidth: 1,
      borderTopColor: Colors.popup,
      height: 150,
      width: '100%',
      justifyContent: 'center',
      paddingBottom: insets.bottom,
      alignItems: 'center',
    },
    controlsContainer: {
      flexDirection: 'row',
      width: Dimensions.get('window').width * 0.85,
      gap: 15,
      // backgroundColor: 'red',
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
    }
  });

  useEffect(() => {
    const results: SongType[] = [];
    try {
      for (let i = 0; i < queue.length; i++) {
        getSongById(queue[i]).then((result) => {
          results.push(result);
        });
      }
      for (let i = 0; i < nextUp.length; i++) {
        getSongById(nextUp[i]).then((result) => {
          results.push(result);
        });
      }
    }
    catch (error) {
      console.log(error);
    }
    setSongs(results);
  }, [nextUp, queue]);

  return (
    <View style={[Styles.body, Local.container]}>
      <PageTitle title="Now Playing"/>
      <View style={Local.currentlyPlayingContainer}>
        <ListCover 
          id={songPlaying.id}
          image={songPlaying.info?.metadata?.artwork}
          propOnLoad={() => {}}
        />
        <SongInfo 
          info={songPlaying.info ? songPlaying.info : {metadata: {}}} 
          name={songPlaying.name ? songPlaying.name : ''}
        />
      </View>
      <Text style={Local.categoryHeader}>Up Next</Text>
      <SongList songs={songs}/>
      <View style={Local.footer}>
        <Time/>
        <View style={Local.controlsContainer}>
          <ShuffleButton/>
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
          <CloseButton action={() => router.back()}/>
        </View>
      </View>
    </View>
  );

}

export default Queue;
