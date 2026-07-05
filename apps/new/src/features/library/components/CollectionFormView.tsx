import { Link } from "expo-router";
import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { CollectionFormActions } from "./CollectionFormActions";
import { CollectionFormFields } from "./CollectionFormFields";
import { CollectionFormHeader } from "./CollectionFormHeader";
import { CollectionImageInput } from "./CollectionImageInput";
import type { CollectionFormViewProps } from "./collection-form-types";

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

  return (
    <View
      className="flex-1 gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <CollectionFormHeader copy={copy} subtitle={subtitle} />

      <View
        className="gap-3 rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <CollectionFormFields
          actionState={actionState}
          artistNames={artistNames}
          copy={copy}
          kind={kind}
          name={name}
          onChangeArtistNames={onChangeArtistNames}
          onChangeName={onChangeName}
          onChangeYear={onChangeYear}
          year={year}
        />
        <CollectionImageInput
          actionState={actionState}
          image={image}
          imageFallbackName={imageFallbackName}
          imageFallbackUri={imageFallbackUri}
          imageInitial={imageInitial}
          kind={kind}
          onPickImage={onPickImage}
        />
        <CollectionFormActions
          actionState={actionState}
          errorMessages={errorMessages}
          isSaving={isSaving}
          onSave={onSave}
          saveLabel={saveLabel}
        />
      </View>

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
