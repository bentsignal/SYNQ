import { useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";
import { updateLibrarySongMetadata } from "../repository/song-metadata-repository";

export function EditLibrarySongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Edit song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link
          href="/(tabs)/library"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to Library
        </Link>
      </View>
    );
  }

  return <EditLibrarySongContent songId={id} />;
}

function EditLibrarySongContent({ songId }: { songId: number }) {
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const [albumNames, setAlbumNames] = useState("");
  const [artistNames, setArtistNames] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedSongId, setLoadedSongId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const hasErrors = errors.length > 0;
  const canSave = !detail.isMissing && title.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (detail.isMissing || loadedSongId === songId) {
      return;
    }

    setTitle(detail.title);
    setArtistNames(detail.artistLabel === "Unknown" ? "" : detail.artistLabel);
    setAlbumNames(detail.albumLabel === "Unknown" ? "" : detail.albumLabel);
    setLoadedSongId(songId);
  }, [detail, loadedSongId, songId]);

  const save = async () => {
    if (!canSave) {
      sendHaptic("error");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateLibrarySongMetadata({
        albumNames,
        artistNames,
        id: songId,
        title,
      });
      sendHaptic("success");
      router.replace(`/(tabs)/library/song/${songId}`);
    } catch (error) {
      sendHaptic("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Song could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
            onChangeText={setTitle}
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
            onChangeText={setArtistNames}
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
            onChangeText={setAlbumNames}
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
          disabled={!canSave}
          onPress={save}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !canSave ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            {isSaving ? "Saving" : "Save"}
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
