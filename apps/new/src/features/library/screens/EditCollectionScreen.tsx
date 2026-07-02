import { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useEditCollectionQuery } from "../hooks/use-edit-collection-query";
import {
  updateAlbum,
  updateArtist,
  updatePlaylist,
} from "../repository/collection-repository";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import {
  getCollectionFormActionState,
  parseAlbumYearInput,
} from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

export type CollectionKind = EditCollectionKind;

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

export function EditCollectionScreen({ kind }: EditCollectionScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

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
  const imageLabel = kind === "artist" ? "Profile image" : "Cover image";
  const collection = useEditCollectionQuery({ id, kind });
  const [image, setImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { canEdit, canPickImage, canSave } = getCollectionFormActionState({
    isMissing: collection.isMissing,
    isSaving,
    name,
  });

  useEffect(() => {
    if (isDirty || !collection.updatedAt) {
      return;
    }

    setName(collection.name);
    setYear(collection.year);
  }, [collection.name, collection.updatedAt, collection.year, isDirty]);

  const handlePickImage = async () => {
    try {
      sendHaptic("light");
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        setImage(pickedImage);
        setIsDirty(true);
      }
    } catch (caughtError) {
      sendHaptic("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Image could not be selected.",
      );
    }
  };

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
        await updateAlbum({
          coverImage: image?.dataUrl,
          id,
          name,
          year: parseAlbumYearInput(year) ?? null,
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/album/${id}`);
        return;
      }

      if (kind === "artist") {
        await updateArtist({
          id,
          name,
          profileImage: image?.dataUrl,
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/artist/${id}`);
        return;
      }

      await updatePlaylist({
        coverImage: image?.dataUrl,
        id,
        name,
      });
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
          Update the name, artwork, and details shown across your library.
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
          editable={canEdit}
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
              editable={canEdit}
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

        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {imageLabel}
        </Text>
        <View style={styles.imageRow}>
          {image || collection.imagePath ? (
            <Image
              source={{ uri: image?.dataUrl ?? collection.imagePath ?? "" }}
              style={styles.imagePreview}
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.imageInitial, { color: theme.accent }]}>
                {name.trim().slice(0, 1).toUpperCase() || copy.kicker[0]}
              </Text>
            </View>
          )}
          <View style={styles.imageText}>
            <Text style={[styles.imageName, { color: theme.primaryText }]}>
              {image?.fileName ??
                (collection.imagePath
                  ? `Saved ${imageLabel.toLowerCase()}`
                  : `No ${imageLabel.toLowerCase()} selected`)}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={!canPickImage}
              onPress={handlePickImage}
              style={[styles.imageButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.imageButtonText, { color: theme.accent }]}>
                Choose image
              </Text>
            </Pressable>
          </View>
        </View>

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
          disabled={!canSave}
          onPress={handleUpdate}
          style={[
            styles.saveButton,
            {
              backgroundColor: canSave ? theme.accent : theme.inactive,
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
  imageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  imagePreview: {
    borderRadius: 8,
    height: 72,
    width: 72,
  },
  imagePlaceholder: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  imageInitial: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 30,
  },
  imageText: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  imageName: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  imageButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 10,
  },
  imageButtonText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
