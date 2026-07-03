import { Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getAddCollectionSongsHeaderState } from "../services/addable-collection-songs-screen-state-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type AddCollectionSongsHeaderProps = {
  kind: LibraryCollectionDetailKind;
  onChangeQuery: (query: string) => void;
  query: string;
};

export function AddCollectionSongsHeader({
  kind,
  onChangeQuery,
  query,
}: AddCollectionSongsHeaderProps) {
  const theme = useCustomizationTheme();
  const state = getAddCollectionSongsHeaderState({ kind });

  return (
    <>
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {state.kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {state.title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {state.subtitle}
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        className="min-h-12 rounded-lg border px-3.5 text-base"
        onChangeText={onChangeQuery}
        placeholder={state.searchInput.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={state.searchInput.returnKeyType}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.primaryText,
        }}
        value={query}
      />
    </>
  );
}
