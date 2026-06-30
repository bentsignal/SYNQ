import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import Bar from "@/src/components/modals/Bar";
import CustomButton from "@/src/components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import {
  PageType,
  SourceType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import ArtistList from "@/src/components/lists/artist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/src/context/ThemeProvider";
import ModalStyles from "@/src/components/modals/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import QueryWrapper from "@/src/components/lists/query/Wrapper";
import { useLibraryArtistsQuery } from "@/src/features/library/hooks/use-library-artists-query";

const AddArtist = () => {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { sourceType } = useLocalSearchParams();
  const { editSong } = useGlobalContext();
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortType>(SortType.ARTIST);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);
  const artistSourceType =
    sourceType === "song" ? SourceType.SONG : SourceType.ALBUM;
  const { artists } = useLibraryArtistsQuery({
    prioritizeSongId: editSong?.id,
    query,
    sort,
    order,
    sourceType: artistSourceType,
  });

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>Add Artists</Text>
      <CustomButton
        title={"New"}
        background={theme}
        handlePress={() => {
          router.push("/artist/create");
        }}
        customStyles={{
          marginBottom: 20,
        }}
      />
      <View style={Styles.divider} />
      <ArtistList
        artists={artists}
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
              [SortType.ARTIST]: true,
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

export default AddArtist;
