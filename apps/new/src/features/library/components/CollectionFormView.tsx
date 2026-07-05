import { Link } from "expo-router";
import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
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
        artistNames={artistNames}
        borderColor={theme.border}
        copy={copy}
        errorMessages={errorMessages}
        fieldState={fieldState}
        image={image}
        imageFallbackName={imageFallbackName}
        imageFallbackUri={imageFallbackUri}
        imageInitial={imageInitial}
        imageLabel={imageLabel}
        isSaving={isSaving}
        name={name}
        onChangeArtistNames={onChangeArtistNames}
        onChangeName={onChangeName}
        onChangeYear={onChangeYear}
        onPickImage={onPickImage}
        onSave={onSave}
        saveLabel={saveLabel}
        surfaceColor={theme.surface}
        year={year}
      />

      <Link
        className="text-[15px] font-extrabold"
        href={backLink.href}
        style={{ color: theme.accent }}
      >
        {backLink.label}
      </Link>
    </View>
  );
}
