import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { ArtistType, PageType } from "@/src/constants/Types";
import { useState, useEffect } from "react";
import ArtistList from "@/src/components/lists/artist";
import { getArtists } from "@/lib/controllers/ArtistController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import playlistBus from "@/src/events/playlist";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Styles as MainStyles } from "@/src/constants/Styles";

const Artists = () => {


  const [artists, setArtists] = useState<ArtistType[]>([]);

  const refreshArtists = async () => {
    const results = await getArtists();
    setArtists(results);
  }

  useEffect(() => {
    refreshArtists();
  }, []);

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