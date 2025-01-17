import { View, Text, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { Colors } from "@/src/constants/Colors"
import { Styles } from "@/src/constants/Styles"
import Bar from "@/src/components/modals/Bar"
import CustomButton from "@/src/components/CustomButton"
import { router } from "expo-router"
import { PageType, AlbumType } from "@/src/constants/Types"
import AlbumList from "@/src/components/lists/album"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/src/context/ThemeProvider"
import { getAlbums } from "@/src/controllers/AlbumController"
import { AlbumBusEvent } from "@/src/events/album/Events"
import albumBus from "@/src/events/album/Bus"
import ModalStyles from "@/src/components/modals/Styles"

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
      <Text style={ModalStyles.header}>Add to Album</Text>
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
