import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/src/constants/Colors"
import { Styles } from "@/src/constants/Styles"
import Bar from "@/src/components/modals/Bar"
import CustomButton from "@/src/components/CustomButton"
import { router } from "expo-router"
import { PageType, ArtistType, SourceType, SortOrder, SortType } from "@/src/constants/Types"
import ArtistList from "@/src/components/lists/artist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/src/context/ThemeProvider"
import { getArtists, getArtistsFromSong } from "@/src/controllers/ArtistController"
import { ArtistBusEvent } from "@/src/events/artist/Events"
import artistBus from "@/src/events/artist/Bus"
import ModalStyles from "@/src/components/modals/Styles"
import { useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "@/src/context/GlobalProvider"
import QueryWrapper from "@/src/components/lists/query/Wrapper"

const AddArtist = () => {

  const { theme } = useThemeContext();

  const insets = useSafeAreaInsets();
  const { sourceType } = useLocalSearchParams();
  const { editSong } = useGlobalContext();
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [query, setQuery] = useState<string>('');
  const [sort, setSort] = useState<SortType>(SortType.ARTIST);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);

  const refreshArtists = async () => {
    try {
      const results = await getArtists(query, sort, order);
      results.forEach(artist => {
        artist.sourceType = sourceType === 'song' ? SourceType.SONG : SourceType.ALBUM;
      });
      if (editSong?.id) {
        const artistsWithSong = await getArtistsFromSong(editSong.id);
        for (let i = 0; i < results.length; i++) {
          if (artistsWithSong.some(a => a.id === results[i].id)) {
            const [item] = results.splice(i, 1);
            results.unshift(item);
          }
        }
      }
      setArtists(results);
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

  useEffect(() => {
    refreshArtists();
  }, [query, sort, order]);

  useEffect(() => {
    refreshArtists();
    artistBus.on(ArtistBusEvent.ARTIST_CREATED, refreshArtists);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_CREATED, refreshArtists);
    }
  }, []);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Add Artists</Text>
      <CustomButton
        title={'New'}
        background={theme}
        handlePress={() => {
          router.push('/artist/create');
        }}
        customStyles={{
          marginBottom: 20,
        }}  
      />
      <View style={Styles.divider} />
      <ArtistList 
        artists={artists}
        pageType={PageType.ADD}
        gradientStart={'rgba(24, 24, 24, 1)'}
        gradientEnd={'rgba(24, 24, 24, 0)'}
        headerComponent={
          <QueryWrapper 
            query={query} 
            setQuery={setQuery} 
            sort={sort} 
            setSort={setSort} 
            order={order} 
            setOrder={setOrder}
            showSortTypes={{
              [SortType.ARTIST]: true,
              [SortType.DATE]: true,
            }}
          />
        }
      />
      <View style={[Local.bottomButtonsWrapper, {paddingBottom: insets.bottom}]}>
        <CustomButton
          title={'Close'}
          handlePress={() => {
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  }
})

export default AddArtist;