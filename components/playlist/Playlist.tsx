import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from "react-native"
import { useState, useEffect, useRef } from "react";
import { PlaylistType, CoverType } from "@/constants/Types";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { ListCover } from "@/components/song/Cover";
import More from "@/components/More";
import { PageType } from "@/constants/Types";
import Select from "@/components/Select";
import { useGlobalContext } from "@/context/GlobalProvider";
import PlaylistDataManager from "@/lib/data/PlaylistDataManager";
import playlistBus from "@/station/playlistBus";

const Playlist = ({playlist, pageType}: {playlist: PlaylistType, pageType: PageType}) => {

  const { 
    
    editSong,

  } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);

  const playlistChangesMade = async (add: boolean) => {
    try {
      const db = PlaylistDataManager.getInstance();
      if (add) {
        await db.addToPlaylist(playlist.id, editSong.id);
      }
      else {
        await db.removeFromPlaylist(playlist.id, editSong.id);
      }
      playlistBus.emit('playlistChangesMade');
    }
    catch (error) {
      console.log('error saving playlist changes: ', error);
    }
  }

  useEffect(() => {
    if (editSong.id && pageType === PageType.CREATE) {
      const db = PlaylistDataManager.getInstance();
      db.isSongInPlaylist(playlist.id, editSong.id).then((result) => {
        setSelected(result);
      });
    }
  }, [editSong]);

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={pageType === PageType.CREATE ? 1 : 0.8}
      disabled={pageType === PageType.CREATE}
      onPress={() => {
        router.push(`/playlist/${playlist.id}`);
      }}
    >
      <ListCover 
        id={playlist.id.toString()}
        type={CoverType.PLAYLIST}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{playlist.name}</Text>
        <Text style={Local.count}>{playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}</Text>
      </View>
      {pageType === PageType.LIBRARY &&
        <More handlePress={() => {}} />
      }
      {pageType === PageType.CREATE &&
        <Select 
          active={selected}
          handlePress={async () => {
            setSelected(!selected);
            await playlistChangesMade(!selected);
          }}
        />
      }
    </TouchableOpacity>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
    backgroundColor: Colors.song,
  },
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    ...Styles.h4,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,

  },
}); 

export default Playlist;