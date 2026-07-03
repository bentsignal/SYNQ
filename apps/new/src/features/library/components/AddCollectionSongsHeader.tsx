import { StyleSheet, Text, TextInput, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailKind } from "../hooks/use-library-collection-detail-query";
import { getAddCollectionSongsHeaderState } from "../services/addable-collection-songs-screen-state-service";

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
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {state.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {state.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {state.subtitle}
        </Text>
      </View>

      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={onChangeQuery}
        placeholder={state.searchInput.placeholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={state.searchInput.returnKeyType}
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
