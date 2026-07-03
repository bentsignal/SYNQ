import { Pressable, Text, TextInput, View } from "react-native";
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
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: option.isActive }}
              onPress={() => {
                sendHaptic("light");
                setSort(option.value);
              }}
              className="min-h-[38px] min-w-[72px] items-center justify-center rounded-lg border px-3"
              style={{
                backgroundColor: option.isActive
                  ? theme.accent
                  : theme.surface,
                borderColor: option.isActive ? theme.accent : theme.border,
              }}
            >
              <Text
                className="text-xs font-extrabold uppercase"
                style={{
                  color: option.isActive ? theme.onAccent : theme.secondaryText,
                }}
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
          className="min-h-[38px] min-w-[72px] items-center justify-center rounded-lg border px-3"
          style={{
            backgroundColor: theme.primaryText,
            borderColor: theme.primaryText,
          }}
        >
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ color: theme.surface }}
          >
            {controlsState.orderLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
