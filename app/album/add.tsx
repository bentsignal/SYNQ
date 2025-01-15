import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/constants/Colors"
import { Styles } from "@/constants/Styles"
import Bar from "@/components/modals/Bar"
import CustomButton from "@/components/CustomButton"
import { router } from "expo-router"
import { PageType, AlbumType } from "@/constants/Types"
import AlbumList from "@/components/lists/album"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/context/ThemeProvider"
import { getAlbums } from "@/lib/controllers/AlbumController"
import { AlbumBusEvent } from "@/src/events/album/Events"
import albumBus from "@/src/events/album/Bus"
import ModalStyles from "@/components/modals/Styles"

const AddAlbum = () => {

  const { theme } = useThemeContext();

  const insets = useSafeAreaInsets();

  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const refreshAlbums = async () => {
    try {
      const results = await getAlbums();
      setAlbums(results);
    }
    catch (error) {
      console.log('error refreshing albums:', error);
    }
  }

  useEffect(() => {
    refreshAlbums();
    albumBus.on(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
    }
  }, []);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Manage Albums</Text>
      <CustomButton
        title={'New'}
        background={theme}
        handlePress={() => {
          router.push('/album/create');
        }}
        customStyles={{
          marginBottom: 20,
        }}  
      />
      <View style={Styles.divider} />
      <AlbumList 
        albums={albums}
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

export default AddAlbum;
