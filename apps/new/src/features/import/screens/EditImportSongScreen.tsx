import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useImportSession } from "../hooks/use-import-session";
import type { ImportSongDraft } from "../types/import-session";

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

const parseTrack = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const track = Number(trimmed);

  if (!Number.isInteger(track) || track < 1) {
    throw new Error("Track must be a positive whole number.");
  }

  return track;
};

export function EditImportSongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import edit
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link href="/(tabs)/import/save" style={[styles.backLink, { color: theme.accent }]}>
          Back to save
        </Link>
      </View>
    );
  }

  return <EditImportSongContent songId={id} />;
}

function EditImportSongContent({ songId }: { songId: number }) {
  const { state, updateImportSong } = useImportSession();
  const theme = useCustomizationTheme();
  const song = useMemo(
    () => state.songs.find((draft) => draft.id === songId) ?? null,
    [songId, state.songs],
  );

  if (!song) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import edit
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Song not staged
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Choose songs again or return to the current review.
        </Text>
        <View style={styles.linkRow}>
          <Link
            href="/(tabs)/import/files"
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to files
          </Link>
          <Link
            href="/(tabs)/import/save"
            style={[styles.backLink, { color: theme.accent }]}
          >
            Back to save
          </Link>
        </View>
      </View>
    );
  }

  return <EditImportSongForm song={song} updateImportSong={updateImportSong} />;
}

function EditImportSongForm({
  song,
  updateImportSong,
}: {
  song: ImportSongDraft;
  updateImportSong: (song: ImportSongDraft) => void;
}) {
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const [album, setAlbum] = useState(song.album);
  const [artist, setArtist] = useState(song.artist);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(song.title);
  const [track, setTrack] = useState(
    song.track === null ? "" : String(song.track),
  );
  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      sendHaptic("error");
      setError("Title is required.");
      return;
    }

    try {
      updateImportSong({
        ...song,
        album: album.trim() || "Unknown",
        artist: artist.trim() || "Unknown",
        title: title.trim(),
        track: parseTrack(track),
      });
      sendHaptic("success");
      router.replace("/(tabs)/import/save");
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Song could not be updated.",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Import edit
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Edit song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Update staged metadata before writing this song to the library.
        </Text>
      </View>

      <View
        style={[
          styles.form,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.label, { color: theme.primaryText }]}>Title</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={(nextTitle) => {
            setTitle(nextTitle);
            setError(null);
          }}
          placeholder="Song title"
          placeholderTextColor={theme.mutedText}
          returnKeyType="next"
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.primaryText,
            },
          ]}
          value={title}
        />

        <Text style={[styles.label, { color: theme.primaryText }]}>
          Artist
        </Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setArtist}
          placeholder="Artist"
          placeholderTextColor={theme.mutedText}
          returnKeyType="next"
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.primaryText,
            },
          ]}
          value={artist}
        />

        <Text style={[styles.label, { color: theme.primaryText }]}>Album</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setAlbum}
          placeholder="Album"
          placeholderTextColor={theme.mutedText}
          returnKeyType="next"
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.primaryText,
            },
          ]}
          value={album}
        />

        <Text style={[styles.label, { color: theme.primaryText }]}>Track</Text>
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={(nextTrack) => {
            setTrack(nextTrack);
            setError(null);
          }}
          placeholder="Track number"
          placeholderTextColor={theme.mutedText}
          returnKeyType="done"
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.primaryText,
            },
          ]}
          value={track}
        />

        <View
          style={[
            styles.filePanel,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.fileLabel, { color: theme.secondaryText }]}>
            Source file
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.fileName, { color: theme.primaryText }]}
          >
            {song.fileName}
          </Text>
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleSave}
          style={[
            styles.saveButton,
            { backgroundColor: theme.accent },
            !canSave ? styles.disabledButton : null,
          ]}
        >
          <Text style={[styles.saveButtonText, { color: theme.onAccent }]}>
            Save song
          </Text>
        </Pressable>
      </View>

      <View style={styles.linkRow}>
        <Link href="/(tabs)/import/save" style={[styles.backLink, { color: theme.accent }]}>
          Back to save
        </Link>
        <Link
          href="/(tabs)/import/files"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to files
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  screen: {
    flex: 1,
    gap: 12,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  filePanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
    padding: 12,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  fileName: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
