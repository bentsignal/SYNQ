import { Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddCollectionSongsFormState } from "../services/addable-collection-songs-screen-state-service";

type AddCollectionSongsHeaderProps = {
  header: AddCollectionSongsFormState["header"];
  onChangeQuery: (query: string) => void;
  query: string;
};

export function AddCollectionSongsHeader({
  header,
  onChangeQuery,
  query,
}: AddCollectionSongsHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {header.kicker}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {header.title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {header.subtitle}
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        className="min-h-12 rounded-lg border px-3.5 text-base"
        onChangeText={onChangeQuery}
        placeholder={header.searchInput.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={header.searchInput.returnKeyType}
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
