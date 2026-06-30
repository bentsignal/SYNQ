import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import Bar from "@/src/components/modals/Bar";
import CustomButton from "@/src/components/CustomButton";
import { router } from "expo-router";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import PlaylistList from "@/src/components/lists/playlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/src/context/ThemeProvider";
import ModalStyles from "@/src/components/modals/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import QueryWrapper from "@/src/components/lists/query/Wrapper";
import { useLibraryPlaylistsQuery } from "@/src/features/library/hooks/use-library-playlists-query";

const AddToPlaylist = () => {
  const { theme } = useThemeContext();
  const { editSong } = useGlobalContext();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const { playlists } = useLibraryPlaylistsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
  });

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Add to Playlist</Text>
      <CustomButton
        title={"New"}
        background={theme}
        handlePress={() => {
          router.push("/playlist/create");
        }}
        customStyles={{
          marginBottom: 20,
        }}
      />
      <View style={Styles.divider} />
      <PlaylistList
        playlists={playlists}
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
              [SortType.TITLE]: true,
              [SortType.DATE]: true,
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

export default AddToPlaylist;
