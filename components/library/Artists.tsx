import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import { ArtistType, PageType } from "@/constants/Types";
import { useState, useEffect } from "react";
import ArtistList from "@/components/lists/artist";
import { getArtists } from "@/lib/controllers/ArtistController";
import artistBus from "@/station/artist";
import { ArtistBusEvent } from "@/station/artist/Events";

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
    artistBus.on(ArtistBusEvent.ARTIST_NAME_MODIFIED, refreshArtists);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_CREATED, refreshArtists);
      artistBus.off(ArtistBusEvent.ARTIST_DELETED, refreshArtists);
      artistBus.off(ArtistBusEvent.ARTIST_NAME_MODIFIED, refreshArtists);      
    }
  }, []);

  return (
    <View style={Local.container}>
      <ArtistList 
        artists={artists}
        pageType={PageType.LIBRARY}
      />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  placeholderText: {
    ...Styles.h3,
    color: Colors.text,
  }
});

export default Artists;