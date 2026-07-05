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
  borderColor: string;
  fields: {
    artistNames?: string;
    copy: CollectionFormCopy;
    fieldState: CollectionFormFieldState;
    name: string;
    onChangeArtistNames?: (artistNames: string) => void;
    onChangeName: (name: string) => void;
    onChangeYear: (year: string) => void;
    year: string;
  };
  formAction: {
    errorMessages: (string | false | null | undefined)[];
    isSaving: boolean;
    onSave: () => void;
    saveLabel: string;
  };
  imageInput: {
    image: CollectionFormImage;
    imageFallbackName?: string | null;
    imageFallbackUri?: string | null;
    imageInitial: string;
    imageLabel: string;
    onPickImage: () => void;
  };
  surfaceColor: string;
};

export function CollectionFormPanel({
  actionState,
  borderColor,
  fields,
  formAction,
  imageInput,
  surfaceColor,
}: CollectionFormPanelProps) {
  return (
    <View
      className="gap-3 rounded-lg border p-4"
      style={{ backgroundColor: surfaceColor, borderColor }}
    >
      <CollectionFormFields
        actionState={actionState}
        artistNames={fields.artistNames}
        copy={fields.copy}
        fieldState={fields.fieldState}
        name={fields.name}
        onChangeArtistNames={fields.onChangeArtistNames}
        onChangeName={fields.onChangeName}
        onChangeYear={fields.onChangeYear}
        year={fields.year}
      />
      <CollectionImageInput
        actionState={actionState}
        image={imageInput.image}
        imageFallbackName={imageInput.imageFallbackName}
        imageFallbackUri={imageInput.imageFallbackUri}
        imageInitial={imageInput.imageInitial}
        imageLabel={imageInput.imageLabel}
        onPickImage={imageInput.onPickImage}
      />
      <CollectionFormActions
        actionState={actionState}
        errorMessages={formAction.errorMessages}
        isSaving={formAction.isSaving}
        onSave={formAction.onSave}
        saveLabel={formAction.saveLabel}
      />
    </View>
  );
}
