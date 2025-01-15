import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { PageType, ArtistType, SourceType } from "@/constants/Types"
import ArtistList from "@/components/lists/artist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/context/ThemeProvider"
import { getArtists } from "@/lib/controllers/ArtistController"
import { ArtistBusEvent } from "@/src/events/artist/Events"
import artistBus from "@/src/events/artist/Bus"
import ModalStyles from "@/components/modals/Styles"
import { useLocalSearchParams } from "expo-router";

const AddArtist = () => {

  const { theme } = useThemeContext();

  const insets = useSafeAreaInsets();
  const { sourceType } = useLocalSearchParams();
  const [artists, setArtists] = useState<ArtistType[]>([]);

  const refreshArtists = async () => {
    try {
      const results = await getArtists();
      results.forEach(artist => {
        artist.sourceType = sourceType === 'song' ? SourceType.SONG : SourceType.ALBUM;
      });
      setArtists(results);
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

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
      <Text style={ModalStyles.header}>Manage Artists</Text>
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