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
import playlistBus from "@/station/playlistBus";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from 'expo-haptics';
import { addToPlaylist, removeFromPlaylist, isSongInPlaylist } from "@/lib/PlaylistManager";

type PlaylistProps = {
  playlist: PlaylistType,
  sheetRef?: React.RefObject<BottomSheet>,
}

const PlaylistItem = ({playlist, sheetRef}: PlaylistProps) => {

  const { 
    
    editSong, haptic, setEditPlaylist, numModified

  } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);

  const playlistChangesMade = async (add: boolean) => {
    try {
      if (add) {
        await addToPlaylist(playlist.id, editSong.id);
      }
      else {
        await removeFromPlaylist(playlist.id, editSong.id);
      }
      playlistBus.emit('playlistChangesMade');
    }
    catch (error) {
      console.log('error saving playlist changes: ', error);
    }
  }

  useEffect(() => {
    if (editSong.id && playlist.pageType === PageType.CREATE) {
      isSongInPlaylist(playlist.id, editSong.id)
        .then((result) => {
          setSelected(result);
        })
        .catch((error) => {
          console.log('error checking if song is in playlist:', error);
        });
    }
  }, [editSong]);

  const handleMore = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditPlaylist(playlist);
    sheetRef?.current?.snapToIndex(0);
  }

  const handleSelect = async () => {
    setSelected(!selected);
    await playlistChangesMade(!selected);
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={playlist.pageType === PageType.CREATE ? 1 : 0.8}
      disabled={playlist.pageType === PageType.CREATE}
      onPress={() => {
        router.push(`/playlist/${playlist.id}`);
      }}
    >
      <ListCover 
        id={playlist.id.toString()}
        type={CoverType.PLAYLIST}
        propOnLoad={() => {}}
        key={numModified.toString()}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{playlist.name}</Text>
        <Text style={Local.count}>{playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}</Text>
      </View>
      {playlist.pageType === PageType.LIBRARY &&
        <More handlePress={handleMore} />
      }
      {playlist.pageType === PageType.CREATE &&
        <Select 
          active={selected}
          handlePress={handleSelect}
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

export default PlaylistItem;