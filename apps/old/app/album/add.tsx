import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import Bar from "@/src/shared/components/modals/Bar";
import CustomButton from "@/src/shared/components/CustomButton";
import { router } from "expo-router";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import AlbumList from "@/src/features/library/components/lists/album";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useLibraryAlbumsQuery } from "@/src/features/library/hooks/use-library-albums-query";

const AddAlbum = () => {
  const { theme } = useThemeContext();
  const { editSong } = useActionSheetContext();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const { albums } = useLibraryAlbumsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
  });

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Add to Album</Text>
      <CustomButton
        title={"New"}
        background={theme}
        handlePress={() => {
          router.push("/album/create");
        }}
        customStyles={{
          marginBottom: 20,
        }}
      />
      <View style={Styles.divider} />
      <AlbumList
        albums={albums}
        pageType={PageType.ADD}
        gradientStart={"rgba(24, 24, 24, 1)"}
        gradientEnd={"rgba(24, 24, 24, 0)"}
        headerComponent={
          <QueryWrapper
            query={query}
            setQuery={setQuery}
            sort={sort}
            setSort={setSort}
            order={order}
            setOrder={setOrder}
            showSortTypes={{
              [SortType.ALBUM]: true,
              [SortType.DATE]: true,
              [SortType.YEAR]: true,
            }}
          />
        }
      />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton
          title={"Close"}
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

export default AddAlbum;
