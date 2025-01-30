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
import { AlbumBusEvent, AlbumImageModifiedEvent, AlbumModifiedEvent } from "@/src/events/album/Events";
import albumBus from "@/src/events/album";
import { addAlbumToSong, removeAlbumFromSong, 
  isAlbumOnSong, getArtistsFromAlbum, getAlbumCover } from "@/src/controllers/AlbumController";
import { addArtistToSong, removeArtistFromSong } from "@/src/controllers/ArtistController";

type AlbumProps = {
  album: AlbumType,
  allowInteraction?: boolean,
  bg?: string,
}

const AlbumItem = ({album, allowInteraction, bg}: AlbumProps) => {

  const { editSong, haptic, setEditAlbum } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);
  const [name, setName] = useState(album.name);
  const [year, setYear] = useState(album.year);
  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => {
    try {
      const cover = await getAlbumCover(album.id);
      if (cover) {
        setCoverImage(cover);
        setEmptyCover(false);
      }
      else {
        setCoverImage('');
        setEmptyCover(true);
      }
    }
    catch (error) {
      console.log('error loading album cover:', error);
    }
  }

  useEffect(() => {
    if (album.image) {
      setCoverImage(album.image);
    }
    else {
      loadCover();
    }
  }, [album.id]);

  const selectionChanged = async (add: boolean) => {
    try {
      if (editSong.pageType === PageType.IMPORT) {
        editSong.importAlbums = editSong.importAlbums ?? [];
        editSong.importAlbums = add ? [...editSong.importAlbums, album] : editSong.importAlbums.filter(a => a.id !== album.id);
        const artists = await getArtistsFromAlbum(album.id);
        editSong.importArtists = add 
          ? [...new Set([...editSong.importArtists, ...artists.filter(artist => 
              !editSong.importArtists.some(a => a.id === artist.id)
            )])] 
          : editSong.importArtists.filter(a => !artists.some(artist => artist.id === a.id));
      }
      else if (add) {
        await addAlbumToSong(album.id, editSong.id);
        const artists = await getArtistsFromAlbum(album.id);
        await Promise.all(artists.map(artist => addArtistToSong(artist.id, editSong.id)));
      }
      else {
        await removeAlbumFromSong(album.id, editSong.id);
        const artists = await getArtistsFromAlbum(album.id);
        await Promise.all(artists.map(artist => removeArtistFromSong(artist.id, editSong.id)));
      }
      albumBus.emit(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, {
        albumId: album.id,
        songId: editSong.id,
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

  const handleAlbumImageModified = async (data: AlbumImageModifiedEvent) => {
    console.log('album image modified: ', data.id, album.id);
    if (data.id === album.id) {
      if (data.image) {
        setCoverImage(data.image);
      }
      else {
        await loadCover();
      }
    }
  }

  useEffect(() => {
    albumBus.on(AlbumBusEvent.ALBUM_MODIFIED, updateInfo);
    albumBus.on(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumImageModified);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_MODIFIED, updateInfo);
      albumBus.off(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, handleAlbumImageModified);
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
      style={[Local.container, {backgroundColor: bg ?? Colors.song}]}
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
        image={coverImage}
        type={CoverType.ALBUM}
        propOnLoad={() => {}}
        empty={emptyCover}
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
    ...Styles.nonSongItem,
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