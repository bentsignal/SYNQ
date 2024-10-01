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

const Library = () => {

  const insets = useSafeAreaInsets();

  const { addNotification, homeState } = useGlobalContext();
  const [songs, setSongs] = useState<SongType[]>([]);

  useEffect(() => {
    const db = DataManager.getInstance();
    db.getSongs().then((results) => {
      let songs: SongType[] = [];
      for (let i = 0; i < results.length; i++) {
        const song = {
          name: results[i].name,
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
  }, [homeState, songs]);

  console.log('songs: ', songs);

  return (
    <View style={[Styles.body, {paddingTop: insets.top}]}>
      <Top />
      <PageTitle title='Library'/>
      <SongList songs={songs} />
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