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
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>Import edit</Text>
        <Text style={styles.title}>Invalid song</Text>
        <Text style={styles.subtitle}>This route needs a numeric id.</Text>
        <Link href="/import/save" style={styles.backLink}>
          Back to save
        </Link>
      </View>
    );
  }

  return <EditImportSongContent songId={id} />;
}

function EditImportSongContent({ songId }: { songId: number }) {
  const { state, updateImportSong } = useImportSession();
  const song = useMemo(
    () => state.songs.find((draft) => draft.id === songId) ?? null,
    [songId, state.songs],
  );

  if (!song) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>Import edit</Text>
        <Text style={styles.title}>Song not staged</Text>
        <Text style={styles.subtitle}>
          Choose songs again or return to the current review.
        </Text>
        <View style={styles.linkRow}>
          <Link href="/import/files" style={styles.backLink}>
            Back to files
          </Link>
          <Link href="/import/save" style={styles.backLink}>
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
      router.replace("/import/save");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Song could not be updated.",
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Import edit</Text>
        <Text style={styles.title}>Edit song</Text>
        <Text style={styles.subtitle}>
          Update staged metadata before writing this song to the library.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={(nextTitle) => {
            setTitle(nextTitle);
            setError(null);
          }}
          placeholder="Song title"
          placeholderTextColor="#74807a"
          returnKeyType="next"
          style={styles.input}
          value={title}
        />

        <Text style={styles.label}>Artist</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setArtist}
          placeholder="Artist"
          placeholderTextColor="#74807a"
          returnKeyType="next"
          style={styles.input}
          value={artist}
        />

        <Text style={styles.label}>Album</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setAlbum}
          placeholder="Album"
          placeholderTextColor="#74807a"
          returnKeyType="next"
          style={styles.input}
          value={album}
        />

        <Text style={styles.label}>Track</Text>
        <TextInput
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={(nextTrack) => {
            setTrack(nextTrack);
            setError(null);
          }}
          placeholder="Track number"
          placeholderTextColor="#74807a"
          returnKeyType="done"
          style={styles.input}
          value={track}
        />

        <View style={styles.filePanel}>
          <Text style={styles.fileLabel}>Source file</Text>
          <Text numberOfLines={2} style={styles.fileName}>
            {song.fileName}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.saveButton, !canSave ? styles.disabledButton : null]}
        >
          <Text style={styles.saveButtonText}>Save song</Text>
        </Pressable>
      </View>

      <View style={styles.linkRow}>
        <Link href="/import/save" style={styles.backLink}>
          Back to save
        </Link>
        <Link href="/import/files" style={styles.backLink}>
          Back to files
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  form: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  label: {
    color: "#29322e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  input: {
    backgroundColor: "#f8faf9",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121417",
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  filePanel: {
    backgroundColor: "#f8faf9",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
    padding: 12,
  },
  fileLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  fileName: {
    color: "#29322e",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: "#ffffff",
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
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
