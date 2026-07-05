import { View } from "react-native";
import type { CollectionFormActionState } from "../services/collection-form-action-state-service";
import type {
  CollectionFormCopy,
  CollectionFormFieldState,
  CollectionFormImage,
} from "./collection-form-types";
import { CollectionFormActions } from "./CollectionFormActions";
import { CollectionFormFields } from "./CollectionFormFields";
import { CollectionImageInput } from "./CollectionImageInput";

type CollectionFormPanelProps = {
  actionState: CollectionFormActionState;
  artistNames?: string;
  borderColor: string;
  copy: CollectionFormCopy;
  errorMessages: (string | false | null | undefined)[];
  fieldState: CollectionFormFieldState;
  image: CollectionFormImage;
  imageFallbackName?: string | null;
  imageFallbackUri?: string | null;
  imageInitial: string;
  imageLabel: string;
  isSaving: boolean;
  name: string;
  onChangeArtistNames?: (artistNames: string) => void;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  surfaceColor: string;
  year: string;
};

export function CollectionFormPanel({
  actionState,
  artistNames,
  borderColor,
  copy,
  errorMessages,
  fieldState,
  image,
  imageFallbackName,
  imageFallbackUri,
  imageInitial,
  imageLabel,
  isSaving,
  name,
  onChangeArtistNames,
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  surfaceColor,
  year,
}: CollectionFormPanelProps) {
  return (
    <View
      className="gap-3 rounded-lg border p-4"
      style={{ backgroundColor: surfaceColor, borderColor }}
    >
      <CollectionFormFields
        actionState={actionState}
        artistNames={artistNames}
        copy={copy}
        fieldState={fieldState}
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
        imageLabel={imageLabel}
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
  );
}
