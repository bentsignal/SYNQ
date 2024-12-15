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
import playlistBus from "@/station/playlist";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from 'expo-haptics';
import { addToPlaylist, removeFromPlaylist, isSongInPlaylist } from "@/lib/PlaylistManager";
import { PlaylistBusEvent, PlaylistNameModifiedEvent, PlaylistSongCountModifiedEvent } from "@/station/playlist/Events";
import { TrueSheet } from '@lodev09/react-native-true-sheet';

type PlaylistProps = {
  playlist: PlaylistType,
  sheetRef?: React.RefObject<BottomSheet>,
}

const PlaylistItem = ({playlist, sheetRef}: PlaylistProps) => {

  const { 
    
    editSong, haptic, setEditPlaylist, numModified

  } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);
  const [songCount, setSongCount] = useState(playlist.songCount);
  const [name, setName] = useState(playlist.name);

  const playlistChangesMade = async (add: boolean) => {
    try {
      if (add) {
        await addToPlaylist(playlist.id, editSong.id);
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, {
          id: playlist.id,
          songCount: songCount + 1,
        });
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      }
      else {
        await removeFromPlaylist(playlist.id, editSong.id);
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, {
          id: playlist.id,
          songCount: songCount - 1,
        });
        playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
      }
    }
    catch (error) {
      console.log('error saving playlist changes: ', error);
    }
  }

  const updateSongCount = (data: PlaylistSongCountModifiedEvent) => {
    if (playlist.id === data.id) {
      setSongCount(data.songCount);
      playlist.songCount = data.songCount;
    }
  }

  const updateName = (data: PlaylistNameModifiedEvent) => {
    if (playlist.id === data.id) {
      setName(data.name);
      playlist.name = data.name;
    }
  }

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, updateSongCount);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, updateName);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, updateSongCount);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, updateName);
    }
  }, []);

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
    TrueSheet.present('playlist-sheet');
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
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{name}</Text>
        <Text style={Local.count}>{songCount} {songCount === 1 ? 'song' : 'songs'}</Text>
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