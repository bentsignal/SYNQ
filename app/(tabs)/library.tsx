import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Styles } from "@/src/constants/Styles";
import PageTitle from '@/src/components/PageTitle';
import Notifications from "@/src/components/notifications/Notifications";
import { useEffect, useState } from "react";
import MiniPlayer from '@/src/components/player/MiniPlayer';
import CategorySelector from "@/src/components/CategorySelector";
import Playlists from "@/src/components/library/Playlists";
import Albums from "@/src/components/library/Albums";
import Artists from "@/src/components/library/Artists";
import Songs from "@/src/components/library/Songs";
import Plus from "@/src/components/Plus";
import { router } from "expo-router";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";

const Library = () => {

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const resetTab = () => {
      setSelected(0); 
    }
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, resetTab);
    }
  }, []);

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