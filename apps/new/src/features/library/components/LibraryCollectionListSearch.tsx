import { StyleSheet, TextInput } from "react-native";
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
      onChangeText={onChangeQuery}
      placeholder={placeholder}
      placeholderTextColor={theme.mutedText}
      returnKeyType="search"
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
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
});
