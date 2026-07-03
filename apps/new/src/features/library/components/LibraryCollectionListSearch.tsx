import { TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibraryCollectionListSearchProps = {
  onChangeQuery: (query: string) => void;
  placeholder: string;
  query: string;
};

export function LibraryCollectionListSearch({
  onChangeQuery,
  placeholder,
  query,
}: LibraryCollectionListSearchProps) {
  const theme = useCustomizationTheme();

  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      className="min-h-[46px] rounded-lg border px-3.5 text-[15px]"
      onChangeText={onChangeQuery}
      placeholder={placeholder}
      placeholderTextColor={theme.mutedText}
      returnKeyType="search"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.primaryText,
      }}
      value={query}
    />
  );
}
