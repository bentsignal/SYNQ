import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { AlbumType, PageType } from "@/src/constants/Types";
import { useState, useEffect } from "react";
import AlbumList from "@/src/components/lists/album";
import { getAlbums } from "@/src/controllers/AlbumController";
import albumBus from "@/src/events/album";
import { AlbumBusEvent } from "@/src/events/album/Events";
import playlistBus from "@/src/events/playlist";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Styles as MainStyles } from "@/src/constants/Styles";

const Albums = () => {

  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const refreshAlbums = async () => {
    const results = await getAlbums();
    setAlbums(results);
  }

  useEffect(() => {
    refreshAlbums();
  }, []);

  useEffect(() => {
    albumBus.on(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
    albumBus.on(AlbumBusEvent.ALBUM_DELETED, refreshAlbums);
    albumBus.on(AlbumBusEvent.ALBUM_MODIFIED, refreshAlbums);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshAlbums);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
      albumBus.off(AlbumBusEvent.ALBUM_DELETED, refreshAlbums);
      albumBus.off(AlbumBusEvent.ALBUM_MODIFIED, refreshAlbums);      
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshAlbums);
    }
  }, []);

  return (
    <View style={Local.container}>
      <AlbumList 
        albums={albums}
        pageType={PageType.LIBRARY}
        emptyComponent={<Text style={Local.emptyText}>No albums in library</Text>}
        bg={Colors.popup}
      />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  emptyText: {
    ...MainStyles.h5,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.text,
  },
});

export default Albums;