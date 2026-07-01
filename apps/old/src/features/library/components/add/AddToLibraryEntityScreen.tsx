import { Colors } from "@/src/constants/Colors";
import {
  type ShowSortTypes,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";
import CustomButton from "@/src/shared/components/CustomButton";
import { Styles } from "@/src/constants/Styles";
import { router, type Href } from "expo-router";
import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AddToLibraryEntityScreenProps = {
  createRoute: Href;
  order: SortOrder;
  query: string;
  renderList: (headerComponent: ReactNode) => ReactNode;
  setOrder: (order: SortOrder) => void;
  setQuery: (query: string) => void;
  setSort: (sort: SortType) => void;
  showSortTypes: ShowSortTypes;
  sort: SortType;
  title: string;
};

export default function AddToLibraryEntityScreen({
  createRoute,
  order,
  query,
  renderList,
  setOrder,
  setQuery,
  setSort,
  showSortTypes,
  sort,
  title,
}: AddToLibraryEntityScreenProps) {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>{title}</Text>
      <CustomButton
        title={"New"}
        background={theme}
        handlePress={() => {
          router.push(createRoute);
        }}
        customStyles={{
          marginBottom: 20,
        }}
      />
      <View style={Styles.divider} />
      {renderList(
        <QueryWrapper
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
          showSortTypes={showSortTypes}
        />,
      )}
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
}

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
