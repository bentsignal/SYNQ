import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from "react-native"
import { useState, useEffect, useRef } from "react";
import { PlaylistType, CoverType } from "@/constants/Types";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import ListCover from "@/components/cover/ListCover";
import More from "@/components/More";
import { PageType } from "@/constants/Types";
import Select from "@/components/Select";
import { useGlobalContext } from "@/context/GlobalProvider";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ArtistType } from "@/constants/Types";
import { ArtistBusEvent, ArtistNameModifiedEvent, ArtistToggledOnSongEvent } from "@/station/artist/Events";
import artistBus from "@/station/artist";
import { addArtistToSong, removeArtistFromSong, isArtistOnSong } from "@/lib/controllers/ArtistController";

type ArtistProps = {
  artist: ArtistType,
}

const ArtistItem = ({artist}: ArtistProps) => {

  const { 
    
    editSong, haptic, setEditArtist, numModified

  } = useGlobalContext();
  
  const [selected, setSelected] = useState(false);
  const [name, setName] = useState(artist.name);

  const selectionChanged = async (add: boolean) => {
    try {
      if (add) {
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
    catch (error) {
      console.log('error saving playlist changes: ', error);
    }
  }

  const checkArtistOnSong = async () => {
    const result = await isArtistOnSong(artist.id, editSong.id);
    setSelected(result);
  }

  const updateName = (data: ArtistNameModifiedEvent) => {
    if (artist.id === data.id) {
      setName(data.name);
      artist.name = data.name;
    }
  }

  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_NAME_MODIFIED, updateName);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_NAME_MODIFIED, updateName);
    }
  }, []);

  useEffect(() => {
    if (editSong.id && artist.pageType === PageType.ADD) {
      checkArtistOnSong();
    }
  }, [editSong]);

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
      style={Local.container}
      activeOpacity={0.8}
      disabled={![PageType.LIBRARY].includes(artist.pageType)}
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
        id={artist.id.toString()}
        type={CoverType.ARTIST}
        propOnLoad={() => {}}
      />
      <View style={Local.textWrapper}>
        <Text style={Local.name}>{name}</Text>
      </View>
      {artist.pageType === PageType.LIBRARY &&
        <More handlePress={handleMore} />
      }
      {artist.pageType === PageType.ADD &&
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
    ...Styles.h4,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,
    fontWeight: '500',
  },
}); 

export default ArtistItem;