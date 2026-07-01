import { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createAlbum,
  createArtist,
  createPlaylist,
} from "../repository/collection-repository";

type CreateCollectionKind = "album" | "artist" | "playlist";

type CreateCollectionScreenProps = {
  kind: CreateCollectionKind;
};

const labels: Record<
  CreateCollectionKind,
  {
    createLabel: string;
    duplicateNoun: string;
    kicker: string;
    namePlaceholder: string;
    title: string;
  }
> = {
  album: {
    createLabel: "Create album",
    duplicateNoun: "album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Create album",
  },
  artist: {
    createLabel: "Create artist",
    duplicateNoun: "artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Create artist",
  },
  playlist: {
    createLabel: "Create playlist",
    duplicateNoun: "playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Create playlist",
  },
};

const parseYear = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const year = Number(trimmed);

  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Album year must be a positive whole number.");
  }

  return year;
};

export function CreateCollectionScreen({ kind }: CreateCollectionScreenProps) {
  const router = useRouter();
  const copy = labels[kind];
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && !isSaving;

  const handleCreate = async () => {
    if (!canSave) {
      setError(`${copy.kicker} name is required.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (kind === "album") {
        const album = await createAlbum({ name, year: parseYear(year) });
        router.replace(`/(tabs)/library/album/${album.id}`);
        return;
      }

      if (kind === "artist") {
        const artist = await createArtist(name);
        router.replace(`/(tabs)/library/artist/${artist.id}`);
        return;
      }

      const playlist = await createPlaylist(name);
      router.replace(`/(tabs)/library/playlist/${playlist.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `${copy.kicker} could not be created.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{copy.kicker}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>
          Creates a {copy.duplicateNoun} row in the shared library database. The
          Library screen updates through live queries.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSaving}
          onChangeText={setName}
          placeholder={copy.namePlaceholder}
          placeholderTextColor="#74807a"
          returnKeyType={kind === "album" ? "next" : "done"}
          style={styles.input}
          value={name}
        />

        {kind === "album" ? (
          <>
            <Text style={styles.label}>Year</Text>
            <TextInput
              editable={!isSaving}
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={setYear}
              placeholder="Album year"
              placeholderTextColor="#74807a"
              returnKeyType="done"
              style={styles.input}
              value={year}
            />
          </>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleCreate}
          style={[styles.saveButton, !canSave ? styles.disabledButton : null]}
        >
          {isSaving ? <ActivityIndicator color="#ffffff" /> : null}
          <Text style={styles.saveText}>
            {isSaving ? "Creating" : copy.createLabel}
          </Text>
        </Pressable>
      </View>

      <Link href="/(tabs)/library" style={styles.backLink}>
        Back to Library
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
    gap: 20,
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
    gap: 12,
    padding: 16,
  },
  label: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  input: {
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121417",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: "#8da39d",
  },
  saveText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
