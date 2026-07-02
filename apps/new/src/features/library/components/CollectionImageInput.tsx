import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getCollectionFormImageLabel,
  type CollectionFormActionState,
} from "../services/collection-form-interaction-service";
import type {
  CollectionFormImage,
  CollectionFormKind,
} from "./collection-form-types";

type CollectionImageInputProps = {
  actionState: CollectionFormActionState;
  image: CollectionFormImage;
  imageFallbackName?: string | null;
  imageFallbackUri?: string | null;
  imageInitial: string;
  kind: CollectionFormKind;
  onPickImage: () => void;
};

export function CollectionImageInput({
  actionState,
  image,
  imageFallbackName,
  imageFallbackUri,
  imageInitial,
  kind,
  onPickImage,
}: CollectionImageInputProps) {
  const theme = useCustomizationTheme();
  const imageLabel = getCollectionFormImageLabel(kind);
  const imageUri = image?.dataUrl ?? imageFallbackUri;
  const imageName =
    image?.fileName ??
    imageFallbackName ??
    `No ${imageLabel.toLowerCase()} selected`;

  return (
    <>
      <Text style={[styles.label, { color: theme.secondaryText }]}>
        {imageLabel}
      </Text>
      <View style={styles.imageRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
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
            {imageName}
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
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
});
