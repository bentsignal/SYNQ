import { TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type {
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "../hooks/use-library-song-preview-query";
import { useLibrarySongListControls } from "../hooks/use-library-song-list-controls";
import { LibrarySongListControlButton } from "./LibrarySongListControlButton";

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
  const { controlsState, selectSort, toggleOrder } =
    useLibrarySongListControls({
      order,
      setOrder,
      setSort,
      sort,
    });

  return (
    <View className="gap-2.5">
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        className="min-h-12 rounded-lg border px-3.5 text-[15px] font-semibold"
        onChangeText={setQuery}
        placeholder={controlsState.searchInput.placeholder}
        placeholderTextColor={theme.mutedText}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.primaryText,
        }}
        value={query}
      />

      <View className="flex-row flex-wrap gap-2">
        {controlsState.sortOptions.map((option) => {
          return (
            <LibrarySongListControlButton
              key={option.value}
              isActive={option.isActive}
              label={option.label}
              onPress={() => selectSort(option.value)}
              theme={theme}
            />
          );
        })}

        <LibrarySongListControlButton
          label={controlsState.orderButton.label}
          onPress={toggleOrder}
          theme={theme}
          variant="toggle"
        />
      </View>
    </View>
  );
}
