import { Link } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";
import type { LibrarySongEditActionState } from "../services/library-song-form-service";

type EditLibrarySongFormViewProps = {
  actionState: LibrarySongEditActionState;
  albumNames: string;
  artistNames: string;
  errorMessage: string | null;
  hasErrors: boolean;
  detail: LibrarySongDetail;
  onChangeAlbumNames: (albumNames: string) => void;
  onChangeArtistNames: (artistNames: string) => void;
  onChangeTitle: (title: string) => void;
  onSave: () => void;
  songId: number;
  title: string;
};

export function EditLibrarySongFormView({
  actionState,
  albumNames,
  artistNames,
  detail,
  errorMessage,
  hasErrors,
  onChangeAlbumNames,
  onChangeArtistNames,
  onChangeTitle,
  onSave,
  songId,
  title,
}: EditLibrarySongFormViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Edit song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {detail.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {detail.originalFileName}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Title
          </Text>
          <TextInput
            onChangeText={onChangeTitle}
            placeholder="Song title"
            placeholderTextColor={theme.mutedText}
            returnKeyType="next"
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            value={title}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Artists
          </Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={onChangeArtistNames}
            placeholder="Artist names"
            placeholderTextColor={theme.mutedText}
            returnKeyType="next"
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            value={artistNames}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Albums
          </Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={onChangeAlbumNames}
            placeholder="Album names"
            placeholderTextColor={theme.mutedText}
            returnKeyType="done"
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.primaryText,
              },
            ]}
            value={albumNames}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!actionState.canSave}
          onPress={onSave}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !actionState.canSave ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            {actionState.saveLabel}
          </Text>
        </Pressable>
        <Link
          href={`/(tabs)/library/song/${songId}`}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.accent,
            },
          ]}
        >
          Cancel
        </Link>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            hasErrors || errorMessage ? styles.errorText : styles.panelText,
            {
              color: hasErrors || errorMessage
                ? theme.danger
                : theme.secondaryText,
            },
          ]}
        >
          {errorMessage ??
            (hasErrors
              ? "One or more song edit queries failed."
              : detail.isMissing
                ? "Song missing from database."
                : "Separate multiple artists or albums with commas.")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
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
  form: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
    minHeight: 44,
    minWidth: 112,
    overflow: "hidden",
    paddingHorizontal: 14,
    textAlign: "center",
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
