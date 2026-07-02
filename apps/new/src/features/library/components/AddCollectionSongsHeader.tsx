import { StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";

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

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Add songs</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Add to {kind}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Search your songs and add them to this collection.
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={onChangeQuery}
        placeholder="Search songs, artists, or albums"
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
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
});
