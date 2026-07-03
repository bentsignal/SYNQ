import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { getLibrarySongListControlsState } from "../services/library-song-preview-state-service";

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
  const controlsState = getLibrarySongListControlsState({ order, sort });

  return (
    <View style={styles.controls}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder={controlsState.searchInput.placeholder}
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
        {controlsState.sortOptions.map((option) => {
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: option.isActive }}
              onPress={() => {
                sendHaptic("light");
                setSort(option.value);
              }}
              style={[
                styles.sortOption,
                {
                  backgroundColor: option.isActive
                    ? theme.accent
                    : theme.surface,
                  borderColor: option.isActive ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  {
                    color: option.isActive
                      ? theme.onAccent
                      : theme.secondaryText,
                  },
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
            setOrder(controlsState.nextOrder);
          }}
          style={[
            styles.orderButton,
            { backgroundColor: theme.primaryText, borderColor: theme.primaryText },
          ]}
        >
          <Text style={[styles.orderText, { color: theme.surface }]}>
            {controlsState.orderLabel}
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
