import { View, Text, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Styles } from "@/constants/Styles";
import PageTitle from '@/components/PageTitle';
import Top from "@/components/Top";
import CustomButton from "@/components/CustomButton";
import { Colors } from "@/constants/Colors";
import Notifications from "@/components/notifications/Notifications";
import { NotificationType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import DataManager from "@/lib/DataManager";
import { useEffect, useState } from "react";
import SongList from "@/components/song/SongList";
import { SongType } from "@/constants/Types";
import * as FileSystem from 'expo-file-system';
import MiniPlayer from '@/components/player/MiniPlayer';

const Library = () => {

  const insets = useSafeAreaInsets();

  const { homeState } = useGlobalContext();
  const [songs, setSongs] = useState<SongType[]>([]);

  useEffect(() => {
    try {
      const db = DataManager.getInstance();
      db.getSongs().then((results) => {
        let songs: SongType[] = [];
        let dir;
        for (let i = 0; i < results.length; i++) {
          dir = `${FileSystem.documentDirectory}library/${results[i].id}`;
          const song = {
            name: results[i].fileName,
            id: results[i].id,
            data: '',
            info: {
              fileType: 'mp3',
              format: 'id3v2.4',
              name: results[i].name,
              metadata: {
                album: results[i].album,
                artist: results[i].artists,
                artwork: '',
                name: results[i].title,
              }
            }
          }
          songs.push(song);
        }
        setSongs(songs);
      });
    }
    catch (error) {
      console.log(error);
    }
  }, [homeState]);

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <Top />
      <PageTitle title='Library'/>
      <SongList songs={songs} />
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