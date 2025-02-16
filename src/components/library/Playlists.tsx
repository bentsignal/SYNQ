import { View, StyleSheet } from "react-native";
import PlaylistList from "@/src/components/lists/playlist"; 
import { useEffect, useState } from "react";
import { PageType, PlaylistType, SortType, SortOrder } from "@/src/constants/Types";
import playlistBus from "@/src/events/playlist";
import { getPlaylists } from "@/src/controllers/PlaylistController";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Colors } from "@/src/constants/Colors";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const Playlists = () => {

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);

  const refreshPlaylists = async () => {
    try {
      const results = await getPlaylists(query, sort, order);
      setPlaylists(results.filter(p =>p.id !== 1));
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

  useEffect(() => {
    refreshPlaylists();
  }, []);

  useEffect(() => {
    refreshPlaylists();
  }, [query, sort, order]);

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_DELETED, refreshPlaylists);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshPlaylists);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_DELETED, refreshPlaylists);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshPlaylists);
    }
  }, []);

  return (
    <View style={Local.container}>
      <PlaylistList
        playlists={playlists}
        pageType={PageType.LIBRARY}
        headerComponent={
          <QueryWrapper 
            setQuery={setQuery} 
            query={query} 
            setSort={setSort} 
            sort={sort} 
            order={order} 
            setOrder={setOrder}
            showSortTypes={{
              [SortType.DATE]: true,
              [SortType.TITLE]: true,
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
});

export default Playlists;