import { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useEditCollectionQuery } from "../hooks/use-edit-collection-query";
import {
  updateAlbum,
  updateArtist,
  updatePlaylist,
} from "../repository/collection-repository";

export type CollectionKind = "album" | "artist" | "playlist";

type EditCollectionScreenProps = {
  kind: CollectionKind;
};

const labels: Record<
  CollectionKind,
  {
    editLabel: string;
    kicker: string;
    namePlaceholder: string;
    title: string;
  }
> = {
  album: {
    editLabel: "Save album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Edit album",
  },
  artist: {
    editLabel: "Save artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Edit artist",
  },
  playlist: {
    editLabel: "Save playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Edit playlist",
  },
};

const parseId = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isFinite(id) ? id : null;
};

const parseYear = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const year = Number(trimmed);

  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Album year must be a positive whole number.");
  }

  return year;
};

export function EditCollectionScreen({ kind }: EditCollectionScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>{labels[kind].kicker}</Text>
        <Text style={styles.title}>Invalid collection</Text>
        <Text style={styles.subtitle}>This route needs a numeric id.</Text>
        <Link href="/(tabs)/library" style={styles.backLink}>
          Back to Library
        </Link>
      </View>
    );
  }

  return <EditCollectionContent id={id} kind={kind} />;
}

function EditCollectionContent({
  id,
  kind,
}: {
  id: number;
  kind: CollectionKind;
}) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const copy = labels[kind];
  const collection = useEditCollectionQuery({ id, kind });
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (isDirty || !collection.updatedAt) {
      return;
    }

    setName(collection.name);
    setYear(collection.year);
  }, [collection.name, collection.updatedAt, collection.year, isDirty]);

  const handleUpdate = async () => {
    if (!canSave) {
      sendHaptic("error");
      setError(`${copy.kicker} name is required.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (kind === "album") {
        await updateAlbum({ id, name, year: parseYear(year) });
        sendHaptic("success");
        router.replace(`/(tabs)/library/album/${id}`);
        return;
      }

      if (kind === "artist") {
        await updateArtist({ id, name });
        sendHaptic("success");
        router.replace(`/(tabs)/library/artist/${id}`);
        return;
      }

      await updatePlaylist({ id, name });
      sendHaptic("success");
      router.replace(`/(tabs)/library/playlist/${id}`);
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `${copy.kicker} could not be updated.`,
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
          Updates the shared library database. Detail and Library screens update
          through live queries.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSaving && !collection.isMissing}
          onChangeText={(nextName) => {
            setIsDirty(true);
            setName(nextName);
          }}
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
              editable={!isSaving && !collection.isMissing}
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={(nextYear) => {
                setIsDirty(true);
                setYear(nextYear);
              }}
              placeholder="Album year"
              placeholderTextColor="#74807a"
              returnKeyType="done"
              style={styles.input}
              value={year}
            />
          </>
        ) : null}

        {collection.isMissing ? (
          <Text style={styles.errorText}>Collection not found.</Text>
        ) : null}
        {collection.error ? (
          <Text style={styles.errorText}>Collection query failed.</Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave || collection.isMissing}
          onPress={handleUpdate}
          style={[
            styles.saveButton,
            !canSave || collection.isMissing ? styles.disabledButton : null,
          ]}
        >
          {isSaving ? <ActivityIndicator color="#ffffff" /> : null}
          <Text style={styles.saveText}>
            {isSaving ? "Saving" : copy.editLabel}
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
