import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";

const sortOptions: {
  label: string;
  value: LibrarySongPreviewSort;
}[] = [
  {
    label: "Recent",
    value: "recent",
  },
  {
    label: "Title",
    value: "title",
  },
  {
    label: "Artist",
    value: "artist",
  },
  {
    label: "Album",
    value: "album",
  },
];

type LibrarySongListControlsProps = {
  order: LibrarySongPreviewOrder;
  query: string;
  setOrder: (order: LibrarySongPreviewOrder) => void;
  setQuery: (query: string) => void;
  setSort: (sort: LibrarySongPreviewSort) => void;
  sort: LibrarySongPreviewSort;
};

export function LibrarySongListControls({
  order,
  query,
  setOrder,
  setQuery,
  setSort,
  sort,
}: LibrarySongListControlsProps) {
  const nextOrder = order === "asc" ? "desc" : "asc";

  return (
    <View style={styles.controls}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder="Search songs, artists, albums"
        placeholderTextColor="#74807a"
        style={styles.searchInput}
        value={query}
      />

      <View style={styles.sortRow}>
        {sortOptions.map((option) => {
          const isActive = option.value === sort;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setSort(option.value)}
              style={[styles.sortOption, isActive ? styles.activeOption : null]}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  isActive ? styles.activeOptionText : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => setOrder(nextOrder)}
          style={styles.orderButton}
        >
          <Text style={styles.orderText}>{order === "asc" ? "Asc" : "Desc"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: 10,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121417",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortOption: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  activeOption: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  sortOptionText: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  activeOptionText: {
    color: "#ffffff",
  },
  orderButton: {
    alignItems: "center",
    backgroundColor: "#17211c",
    borderColor: "#17211c",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  orderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
