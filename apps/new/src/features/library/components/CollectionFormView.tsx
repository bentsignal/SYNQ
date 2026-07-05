import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { LibraryBackLink } from "./LibraryBackLink";
import { CollectionFormHeader } from "./CollectionFormHeader";
import { CollectionFormPanel } from "./CollectionFormPanel";
import type { CollectionFormViewProps } from "./collection-form-types";
import {
  getCollectionFormFieldState,
  getCollectionFormImageLabel,
} from "../services/collection-form-field-state-service";

export function CollectionFormView({
  actionState,
  artistNames,
  backLink,
  copy,
  errorMessages = [],
  image,
  imageFallbackName,
  imageFallbackUri,
  imageInitial,
  isSaving,
  kind,
  name,
  onChangeArtistNames,
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  subtitle,
  year,
}: CollectionFormViewProps) {
  const theme = useCustomizationTheme();
  const fieldState = getCollectionFormFieldState(kind);
  const imageLabel = getCollectionFormImageLabel(kind);

  return (
    <View
      className="flex-1 gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <CollectionFormHeader copy={copy} subtitle={subtitle} />

      <CollectionFormPanel
        actionState={actionState}
        borderColor={theme.border}
        fields={{
          artistNames,
          copy,
          fieldState,
          name,
          onChangeArtistNames,
          onChangeName,
          onChangeYear,
          year,
        }}
        formAction={{
          errorMessages,
          isSaving,
          onSave,
          saveLabel,
        }}
        imageInput={{
          image,
          imageFallbackName,
          imageFallbackUri,
          imageInitial,
          imageLabel,
          onPickImage,
        }}
        surfaceColor={theme.surface}
      />

      <LibraryBackLink backLink={backLink} theme={theme} />
    </View>
  );
}
