import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionFormActionState } from "../services/collection-form-service";
import type { EditCollectionKind } from "../services/edit-collection-query-service";

type EditCollectionFormCopy = {
  kicker: string;
  namePlaceholder: string;
  title: string;
};

type EditCollectionImage = {
  dataUrl: string;
  fileName: string;
} | null;

type EditCollectionFormViewProps = {
  actionState: CollectionFormActionState;
  collectionError: boolean;
  collectionImagePath: string | null;
  collectionIsMissing: boolean;
  copy: EditCollectionFormCopy;
  error: string | null;
  image: EditCollectionImage;
  imageInitial: string;
  isSaving: boolean;
  kind: EditCollectionKind;
  name: string;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  year: string;
};

export function EditCollectionFormView({
  actionState,
  collectionError,
  collectionImagePath,
  collectionIsMissing,
  copy,
  error,
  image,
  imageInitial,
  isSaving,
  kind,
  name,
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  year,
}: EditCollectionFormViewProps) {
  const theme = useCustomizationTheme();
  const imageLabel = kind === "artist" ? "Profile image" : "Cover image";

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
          editable={actionState.canEdit}
          onChangeText={onChangeName}
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
              editable={actionState.canEdit}
              inputMode="numeric"
              keyboardType="number-pad"
              onChangeText={onChangeYear}
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
          {image || collectionImagePath ? (
            <Image
              source={{ uri: image?.dataUrl ?? collectionImagePath ?? "" }}
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
                {imageInitial}
              </Text>
            </View>
          )}
          <View style={styles.imageText}>
            <Text style={[styles.imageName, { color: theme.primaryText }]}>
              {image?.fileName ??
                (collectionImagePath
                  ? `Saved ${imageLabel.toLowerCase()}`
                  : `No ${imageLabel.toLowerCase()} selected`)}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={!actionState.canPickImage}
              onPress={onPickImage}
              style={[styles.imageButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.imageButtonText, { color: theme.accent }]}>
                Choose image
              </Text>
            </Pressable>
          </View>
        </View>

        {collectionIsMissing ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>
            Collection not found.
          </Text>
        ) : null}
        {collectionError ? (
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
          disabled={!actionState.canSave}
          onPress={onSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: actionState.canSave
                ? theme.accent
                : theme.inactive,
            },
          ]}
        >
          {isSaving ? <ActivityIndicator color={theme.onAccent} /> : null}
          <Text style={[styles.saveText, { color: theme.onAccent }]}>
            {saveLabel}
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
