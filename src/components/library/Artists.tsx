import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { ArtistType, PageType, 
  SortOrder, SortType } from "@/src/constants/Types";
import { useState, useEffect } from "react";
import ArtistList from "@/src/components/lists/artist";
import { getArtists } from "@/src/controllers/ArtistController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import playlistBus from "@/src/events/playlist";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Styles as MainStyles } from "@/src/constants/Styles";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const Artists = () => {


  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [showEmptyComponent, setShowEmptyComponent] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>(SortType.ARTIST);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);

  const refreshArtists = async () => {
    const results = await getArtists(query, sort, order);
    setArtists(results);
    setShowEmptyComponent(results.length === 0);
  }

  useEffect(() => {
    refreshArtists();
  }, []);

  useEffect(() => {
    refreshArtists();
  }, [query, sort, order]);

  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_CREATED, refreshArtists);
    artistBus.on(ArtistBusEvent.ARTIST_DELETED, refreshArtists);
    artistBus.on(ArtistBusEvent.ARTIST_MODIFIED, refreshArtists);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshArtists);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_CREATED, refreshArtists);
      artistBus.off(ArtistBusEvent.ARTIST_DELETED, refreshArtists);
      artistBus.off(ArtistBusEvent.ARTIST_MODIFIED, refreshArtists);      
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshArtists);
    }
  }, []);

  return (
    <View style={Local.container}>
      <ArtistList 
        artists={artists}
        pageType={PageType.LIBRARY}
        emptyComponent={<Text style={Local.emptyText}>No artists in library</Text>}
        showEmptyComponent={showEmptyComponent}
        headerComponent={
          <QueryWrapper 
            setQuery={setQuery} 
            query={query} 
            setSort={setSort} 
            sort={sort} 
            order={order} 
            setOrder={setOrder}
            showSortTypes={{
              [SortType.ARTIST]: true,
              [SortType.DATE]: true,
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

export default Artists;