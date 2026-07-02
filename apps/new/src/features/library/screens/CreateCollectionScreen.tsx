import { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  createAlbum,
  createArtistWithImage,
  createPlaylist,
} from "../repository/collection-repository";
import { pickCollectionImage } from "../services/collection-image-picker-service";
import { parseAlbumYearInput } from "../services/collection-form-service";

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

export function CreateCollectionScreen({ kind }: CreateCollectionScreenProps) {
  const router = useRouter();
  const { sendHaptic } = useHapticFeedback();
  const theme = useCustomizationTheme();
  const copy = labels[kind];
  const imageLabel = kind === "artist" ? "Profile image" : "Cover image";
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && !isSaving;

  const handlePickImage = async () => {
    try {
      sendHaptic("light");
      const pickedImage = await pickCollectionImage();
      if (pickedImage) {
        setImage(pickedImage);
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

  const handleCreate = async () => {
    if (!canSave) {
      sendHaptic("error");
      setError(`${copy.kicker} name is required.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (kind === "album") {
        const album = await createAlbum({
          coverImage: image?.dataUrl,
          name,
          year: parseAlbumYearInput(year),
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/album/${album.id}`);
        return;
      }

      if (kind === "artist") {
        const artist = await createArtistWithImage({
          name,
          profileImage: image?.dataUrl,
        });
        sendHaptic("success");
        router.replace(`/(tabs)/library/artist/${artist.id}`);
        return;
      }

      const playlist = await createPlaylist({
        coverImage: image?.dataUrl,
        name,
      });
      sendHaptic("success");
      router.replace(`/(tabs)/library/playlist/${playlist.id}`);
    } catch (caughtError) {
      sendHaptic("error");
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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {copy.kicker}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {copy.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Name the {copy.duplicateNoun}, choose optional artwork, and start
          organizing your music.
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
          editable={!isSaving}
          onChangeText={setName}
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
              editable={!isSaving}
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={setYear}
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
          {image ? (
            <Image source={{ uri: image.dataUrl }} style={styles.imagePreview} />
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
              {image?.fileName ?? `No ${imageLabel.toLowerCase()} selected`}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handlePickImage}
              style={[styles.imageButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.imageButtonText, { color: theme.accent }]}>
                Choose image
              </Text>
            </Pressable>
          </View>
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleCreate}
          style={[
            styles.saveButton,
            {
              backgroundColor: canSave ? theme.accent : theme.inactive,
            },
          ]}
        >
          {isSaving ? <ActivityIndicator color={theme.onAccent} /> : null}
          <Text style={[styles.saveText, { color: theme.onAccent }]}>
            {isSaving ? "Creating" : copy.createLabel}
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
