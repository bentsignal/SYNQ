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
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
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
  const theme = useCustomizationTheme();
  const id = parseId(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {labels[kind].kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid collection
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
  const theme = useCustomizationTheme();
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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {copy.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {copy.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Updates the shared library database. Detail and Library screens update
          through live queries.
        </Text>
      </View>

      <View
        style={[
          styles.form,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.label, { color: theme.secondaryText }]}>Name</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSaving && !collection.isMissing}
          onChangeText={(nextName) => {
            setIsDirty(true);
            setName(nextName);
          }}
          placeholder={copy.namePlaceholder}
          placeholderTextColor={theme.mutedText}
          returnKeyType={kind === "album" ? "next" : "done"}
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.primaryText },
          ]}
          value={name}
        />

        {kind === "album" ? (
          <>
            <Text style={[styles.label, { color: theme.secondaryText }]}>
              Year
            </Text>
            <TextInput
              editable={!isSaving && !collection.isMissing}
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={(nextYear) => {
                setIsDirty(true);
                setYear(nextYear);
              }}
              placeholder="Album year"
              placeholderTextColor={theme.mutedText}
              returnKeyType="done"
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.primaryText },
              ]}
              value={year}
            />
          </>
        ) : null}

        {collection.isMissing ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            Collection not found.
          </Text>
        ) : null}
        {collection.error ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            Collection query failed.
          </Text>
        ) : null}
        {error ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave || collection.isMissing}
          onPress={handleUpdate}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                canSave && !collection.isMissing ? theme.accent : theme.inactive,
            },
          ]}
        >
          {isSaving ? <ActivityIndicator color={theme.onAccent} /> : null}
          <Text style={[styles.saveText, { color: theme.onAccent }]}>
            {isSaving ? "Saving" : copy.editLabel}
          </Text>
        </Pressable>
      </View>

      <Link
        href="/(tabs)/library"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to Library
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
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
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
