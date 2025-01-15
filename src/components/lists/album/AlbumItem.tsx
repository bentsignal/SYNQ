import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react";
import { CoverType, PageType } from "@/src/constants/Types";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { router } from "expo-router";
import ListCover from "@/src/components/cover/ListCover";
import More from "@/src/components/More";
import Select from "@/src/components/Select";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { AlbumType } from "@/src/constants/Types";
import { AlbumBusEvent, AlbumModifiedEvent } from "@/src/events/album/Events";
import albumBus from "@/src/events/album";
import { addAlbumToSong, removeAlbumFromSong, isAlbumOnSong } from "@/lib/controllers/AlbumController";

type AlbumProps = {
  album: AlbumType,
  allowInteraction?: boolean,
}

const AlbumItem = ({album, allowInteraction}: AlbumProps) => {

  const { editSong, haptic, setEditAlbum } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);
  const [name, setName] = useState(album.name);
  const [year, setYear] = useState(album.year);

  const selectionChanged = async (add: boolean) => {
    try {
      if (editSong.pageType === PageType.IMPORT) {
        editSong.importAlbums = editSong.importAlbums ?? [];
        editSong.importAlbums = add ? [...editSong.importAlbums, album] : editSong.importAlbums.filter(a => a.id !== album.id);
      }
      else if (add) {
        await addAlbumToSong(album.id, editSong.id);
      }
      else {
        await removeAlbumFromSong(album.id, editSong.id);
      }
      albumBus.emit(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, {
        albumId: album.id,
        songId: typeof editSong.id === 'number' ? editSong.id : parseInt(editSong.id),
        add: add,
      });
    }
    catch (error) {
      console.log('error saving album list changes: ', error);
    }
  }

  const checkAlbumOnSong = async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result = editSong.importAlbums?.some(a => a.id === album.id);
    }
    else {
      result = await isAlbumOnSong(album.id, editSong.id);
    }
    setSelected(result);
  }

  const updateInfo = (data: AlbumModifiedEvent) => {
    if (album.id === data.id) {
      setName(data.name);
      setYear(data.year);
      album.name = data.name;
      album.year = data.year;
    }
  }

  useEffect(() => {
    albumBus.on(AlbumBusEvent.ALBUM_MODIFIED, updateInfo);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_MODIFIED, updateInfo);
    }
  }, []);

  useEffect(() => {
    if (editSong.id && album.pageType === PageType.ADD) {
      checkAlbumOnSong();
    }
  }, [editSong]);

  const handleMore = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditAlbum(album);
    TrueSheet.present('album-sheet');
  }

  const handleSelect = async () => {
    setSelected(!selected);
    await selectionChanged(!selected);
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.8}
      disabled={!allowInteraction || ![PageType.LIBRARY].includes(album.pageType)}
      onPress={async () => {
        if (album.pageType === PageType.ADD) {
          await handleSelect();
        }
        else {
          router.push(`/album/${album.id}`);
        }
      }}
    >
      <ListCover 
        id={album.id.toString()}
        type={CoverType.ALBUM}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name} numberOfLines={1}>{name}</Text>
        {year && <Text style={Local.year} numberOfLines={1}>{year}</Text>}
      </View>
      {allowInteraction && album.pageType === PageType.LIBRARY &&
        <More handlePress={handleMore} />
      }
      {allowInteraction && album.pageType === PageType.ADD &&
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
    width: '90%',
  },
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    ...Styles.h5,
    color: Colors.text,
  },
  year: {
    ...Styles.sub,
    color: Colors.infoText,
    fontWeight: '500',
  },
}); 

export default AlbumItem; 