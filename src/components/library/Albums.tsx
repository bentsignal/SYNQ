import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { AlbumType, PageType, SortOrder, SortType } from "@/src/constants/Types";
import { useState, useEffect } from "react";
import AlbumList from "@/src/components/lists/album";
import { getAlbums } from "@/src/controllers/AlbumController";
import albumBus from "@/src/events/album";
import { AlbumBusEvent } from "@/src/events/album/Events";
import playlistBus from "@/src/events/playlist";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Styles as MainStyles } from "@/src/constants/Styles";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const Albums = () => {

  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [showEmptyComponent, setShowEmptyComponent] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>(SortType.ALBUM);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);

  const refreshAlbums = async () => {
    const results = await getAlbums(query, sort, order);
    setAlbums(results);
    setShowEmptyComponent(results.length === 0);
  }

  useEffect(() => {
    refreshAlbums();
  }, []);

  useEffect(() => {
    refreshAlbums();
  }, [query, sort, order]);

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
        showEmptyComponent={showEmptyComponent}
        headerComponent={
          <QueryWrapper 
            setQuery={setQuery} 
            query={query} 
            setSort={setSort} 
            sort={sort} 
            order={order} 
            setOrder={setOrder}
            hideSortTypes={{
              [SortType.TITLE]: true,
              [SortType.ARTIST]: true,
              [SortType.TRACK]: true,
            }}
            />
        }
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