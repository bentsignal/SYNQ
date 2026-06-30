import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongListPageCover from "@/src/components/cover/SongListPageCover";
import { ArtistType, CoverType, PageType } from "@/src/constants/Types";
import { useEffect } from "react";
import { router } from "expo-router";
import { getArtistCover } from "@/src/controllers/ArtistController";
import ListCover from "../../cover/ListCover";
import CountAndDuration from "../../song/CountAndDuration";
import { ListStyles } from "../Styles";

type AlbumHeaderProps = {
  id: number;
  title: string;
  year?: number;
  pageType: PageType; 
  leadArtist?: ArtistType;
  songCount?: number;
  duration?: number;
  image?: string;
}

const AlbumHeader = ({id, title, year, pageType, leadArtist, songCount, duration, image}: AlbumHeaderProps) => {
  const insets = useSafeAreaInsets();
  const [artistCover, setArtistCover] = useState('');
  const [emptyArtistCover, setEmptyArtistCover] = useState(false);

  const loadCover = async () => {
    try {
      const cover = await getArtistCover(leadArtist.id);
      if (cover) {
        setArtistCover(cover);
        setEmptyArtistCover(false);
      }
      else {
        setArtistCover('');
        setEmptyArtistCover(true);
      }
    }
    catch (error) {
      console.log('error loading artist cover:', error);
    }
  }

  useEffect(() => {
    loadCover();
  }, [leadArtist]);
  
  return (
    <View style={[Local.container, {paddingTop: insets.top}]}>
      <View style={Local.coverWrapper}>
        <SongListPageCover id={id} type={pageType} image={image}/>
      </View>
      <View style={ListStyles.infoWrapper}>
        <Text style={ListStyles.title}>{title}</Text>
        <Text style={ListStyles.sub}>Album · {year ?? 'Unknown Year'}</Text>
        <CountAndDuration songCount={songCount} duration={duration}/>
        {/* {leadArtist &&
          <TouchableOpacity 
            activeOpacity={0.8}
            style={Local.leadArtistContainer}
            onPress={() => router.push(`/artist/${leadArtist.id}`)}
          >
            <ListCover
              image={artistCover}
              type={CoverType.ARTIST}
              propOnLoad={() => {}}
              empty={emptyArtistCover}
              size={25}
            />
            <Text style={Local.leadArtistName}>{leadArtist.name}</Text> 
          </TouchableOpacity>
        } */}
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  leadArtistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
    gap: 3,
    marginTop: 3,
  },
  leadArtistName: {
    ...Styles.h4,
    color: Colors.text,
    marginVertical: 3,
  },
  coverWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  }
});

export default AlbumHeader;
