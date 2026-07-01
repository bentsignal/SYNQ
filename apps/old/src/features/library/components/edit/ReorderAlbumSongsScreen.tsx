import { useEffect, useRef, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { PageType, SongType, SortOrder, SortType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import SongList from "@/src/features/library/components/lists/song/SongList";
import { useAlbumSongsQuery } from "@/src/features/library/hooks/use-album-songs-query";
import { updateAlbumSongOrder } from "@/src/features/library/repository/album-song-repository";
import CustomButton from "@/src/shared/components/CustomButton";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { DragEndParams } from "react-native-draggable-flatlist";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ReorderAlbumSongsScreen = () => {
  const { editAlbum } = useActionSheetContext();
  const insets = useSafeAreaInsets();
  const { songs: albumSongs } = useAlbumSongsQuery({
    albumId: editAlbum.id,
    sort: SortType.TRACK,
    order: SortOrder.ASC,
  });
  const [songs, setSongs] = useState<SongType[]>(albumSongs);
  const dragRef = useRef<any>(null);

  const listOpacity = useSharedValue(0);

  const listContainerStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    flex: 1,
    width: "100%",
    alignSelf: "center",
  }));

  useEffect(() => {
    setSongs(albumSongs);
    listOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [albumSongs, listOpacity]);

  const onDragEnd = async ({ data, from, to }: DragEndParams<SongType>) => {
    setSongs(data);
    if (from === to) {
      return;
    }

    await updateAlbumSongOrder(
      editAlbum.id,
      data.map((song) => song.id),
    );
  };

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
          gradientStart="rgba(24, 24, 24, 1)"
          gradientEnd="rgba(24, 24, 24, 0)"
          footerComponent={<View style={{ height: 500 }} />}
          draggable={true}
          onDragEnd={onDragEnd}
        />
      </Animated.View>
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton
          title="Close"
          handlePress={() => {
            router.back();
          }}
        />
      </View>
    </View>
  );
};

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
});

export default ReorderAlbumSongsScreen;
