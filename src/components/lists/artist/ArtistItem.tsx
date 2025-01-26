import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react";
import { CoverType, PageType, SourceType } from "@/src/constants/Types";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import ListCover from "@/src/components/cover/ListCover";
import More from "@/src/components/More";
import Select from "@/src/components/Select";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ArtistType } from "@/src/constants/Types";
import { ArtistBusEvent, ArtistImageModifiedEvent, ArtistModifiedEvent } from "@/src/events/artist/Events";
import artistBus from "@/src/events/artist";
import { addArtistToSong, removeArtistFromSong, isArtistOnSong, getArtistCover } from "@/src/controllers/ArtistController";
import { addArtistToAlbum, removeArtistFromAlbum, isArtistOnAlbum } from "@/src/controllers/AlbumController";

type ArtistProps = {
  artist: ArtistType,
  allowInteraction?: boolean,
  bg?: string,
}

const ArtistItem = ({artist, allowInteraction, bg}: ArtistProps) => {

  const { editSong, haptic, setEditArtist, editAlbum } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);
  const [name, setName] = useState(artist.name);
  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);

  const loadCover = async () => {
    try {
      const cover = await getArtistCover(artist.id);
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
      console.log('error loading artist cover:', error);
    }
  }

  const selectionChanged = async (add: boolean) => {
    try {
      if (artist.sourceType === SourceType.ALBUM && editAlbum) {
        if (add) {
          await addArtistToAlbum(artist.id, editAlbum.id);
        } else {
          await removeArtistFromAlbum(artist.id, editAlbum.id);
        }
        artistBus.emit(ArtistBusEvent.ARTIST_TOGGLED_ON_ALBUM, {
          artistId: artist.id,
          albumId: editAlbum.id,
          add: add,
        });
      } 
      else if (artist.sourceType === SourceType.SONG && editSong) {
        if (editSong.pageType === PageType.IMPORT) {
          editSong.importArtists = editSong.importArtists ?? [];
          editSong.importArtists = add ? [...editSong.importArtists, artist] : editSong.importArtists.filter(a => a.id !== artist.id);
        }
        else if (add) {
          await addArtistToSong(artist.id, editSong.id);
        }
        else {
          await removeArtistFromSong(artist.id, editSong.id);
        }
        artistBus.emit(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, {
          artistId: artist.id,
          songId: editSong.id,
          add: add,
        });
      }
    }
    catch (error) {
      console.log('error saving artist list changes: ', error);
    }
  }

  const checkArtistOnSong = async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result = editSong.importArtists?.some(a => a.id === artist.id);
    }
    else {
      result = await isArtistOnSong(artist.id, editSong.id);
    }
    setSelected(result);
  }

  const checkArtistOnAlbum = async () => {
    console.log(artist.id, editAlbum.id);
    const result = await isArtistOnAlbum(artist.id, editAlbum.id);
    console.log(artist.name, result);
    setSelected(result);
  }

  const updateInfo = (data: ArtistModifiedEvent) => {
    if (artist.id === data.id) {
      setName(data.name);
      artist.name = data.name;
    }
  }

  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_MODIFIED, updateInfo);
    artistBus.on(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistImageModified);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_MODIFIED, updateInfo);
      artistBus.off(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, handleArtistImageModified);
    }
  }, []);

  useEffect(() => {
    if (editSong.id && artist.sourceType === SourceType.SONG) {
      checkArtistOnSong();
    }
    else if (editAlbum.id && artist.sourceType === SourceType.ALBUM) {
      checkArtistOnAlbum();
    }
  }, [editSong, editAlbum]);

  useEffect(() => {
    if (artist.image) {
      setCoverImage(artist.image);
    }
    else {
      loadCover();
    }
  }, [artist]);

  const handleArtistImageModified = async (data: ArtistImageModifiedEvent) => {
    if (data.id === artist.id) {
      if (data.image) {
        setCoverImage(data.image);
      }
      else {
        await loadCover();
      }
    }
  }

  const handleMore = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditArtist(artist);
    TrueSheet.present('artist-sheet');
  }

  const handleSelect = async () => {
    setSelected(!selected);
    await selectionChanged(!selected);
  }

  return (
    <TouchableOpacity 
      style={[Local.container, {backgroundColor: bg ?? Colors.song}]}
      activeOpacity={0.8}
      disabled={!allowInteraction || ![PageType.LIBRARY, PageType.ALBUM].includes(artist.pageType)}
      onPress={async () => {
        if (artist.pageType === PageType.ADD) {
          await handleSelect();
        }
        else {
          router.push(`/artist/${artist.id}`);
        }
      }}
    >
      <ListCover
        image={coverImage}
        type={CoverType.ARTIST}
        propOnLoad={() => {}}
        empty={emptyCover}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{name}</Text>
      </View>
      {allowInteraction && artist.pageType === PageType.LIBRARY &&
        <More handlePress={handleMore} />
      }
      {allowInteraction && artist.pageType === PageType.ADD &&
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
    ...Styles.h4,
    color: Colors.text,
  },
}); 

export default ArtistItem;