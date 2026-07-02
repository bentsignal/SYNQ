import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
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
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const nextOrder = order === "asc" ? "desc" : "asc";

  return (
    <View style={styles.controls}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder="Search songs, artists, albums"
        placeholderTextColor={theme.mutedText}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.primaryText,
          },
        ]}
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
              onPress={() => {
                sendHaptic("light");
                setSort(option.value);
              }}
              style={[
                styles.sortOption,
                {
                  backgroundColor: isActive ? theme.accent : theme.surface,
                  borderColor: isActive ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  { color: isActive ? theme.onAccent : theme.secondaryText },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            sendHaptic("light");
            setOrder(nextOrder);
          }}
          style={[
            styles.orderButton,
            { backgroundColor: theme.primaryText, borderColor: theme.primaryText },
          ]}
        >
          <Text style={[styles.orderText, { color: theme.surface }]}>
            {order === "asc" ? "Asc" : "Desc"}
          </Text>
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
    borderRadius: 8,
    borderWidth: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  orderButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  orderText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
