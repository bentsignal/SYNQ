import { View, Text, StyleSheet } from "react-native"
import { useEffect, useRef, useState } from "react"
import { Colors } from "@/src/constants/Colors"
import { Styles } from "@/src/constants/Styles"
import Bar from "@/src/components/modals/Bar"
import CustomButton from "@/src/components/CustomButton"
import { router } from "expo-router"
import { PageType, AlbumType, SortOrder, SortType, SongType } from "@/src/constants/Types"
import AlbumList from "@/src/components/lists/album"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useThemeContext } from "@/src/context/ThemeProvider"
import { getAlbums, getAlbumsContainingSong, updateTrackNumber } from "@/src/controllers/AlbumController"
import ModalStyles from "@/src/components/modals/Styles"
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider"
import QueryWrapper from "@/src/components/lists/query/Wrapper"
import SongList from "@/src/components/lists/song/SongList"
import { getSongsFromAlbum } from "@/src/controllers/AlbumController"
import { DragEndParams } from "react-native-draggable-flatlist"
import Animated, { useSharedValue, useAnimatedStyle, 
  withTiming, Easing } from "react-native-reanimated";

const AddAlbum = () => {

  const { editAlbum } = useActionSheetContext();
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const [songs, setSongs] = useState<SongType[]>([]);
  const dragRef = useRef<any>(null);

  const listOpacity = useSharedValue(0);

  const listContainerStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  }));

  useEffect(() => {
    const getSongs = async () => {
      const songs = await getSongsFromAlbum(editAlbum.id);
      setSongs(songs);
      listOpacity.value = withTiming(1, {duration: 500, easing: Easing.inOut(Easing.ease)});
    }
    getSongs();
  }, []);

  const onDragEnd = async ({ data, from, to }: DragEndParams<any>) => {
    setSongs(data);
    for (let i = 0; i < data.length; i++) {
      await updateTrackNumber(editAlbum.id, data[i].id, i + 1);
    }
  }

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Reorder Songs</Text>
      <View style={Styles.divider} />
      <Animated.View style={listContainerStyle}>
        <SongList 
          songs={songs}
          dragRef={dragRef}
          pageType={PageType.REORDER}
          gradientStart={'rgba(24, 24, 24, 1)'}
          gradientEnd={'rgba(24, 24, 24, 0)'}
          footerComponent={<View style={{height: 500}}/>}
          draggable={true}
          onDragEnd={onDragEnd}
        />
      </Animated.View>
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
  listContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'red',
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  }
})

export default AddAlbum;
