import type { CollectionFormActionState } from "../services/collection-form-action-state-service";
import type {
  CollectionFormCopy,
  CollectionFormFieldState,
} from "./collection-form-types";
import { CollectionFormTextField } from "./CollectionFormTextField";

type CollectionFormFieldsProps = {
  actionState: CollectionFormActionState;
  artistNames?: string;
  copy: CollectionFormCopy;
  fieldState: CollectionFormFieldState;
  name: string;
  onChangeArtistNames?: (artistNames: string) => void;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  year: string;
};

export function CollectionFormFields({
  actionState,
  artistNames,
  copy,
  fieldState,
  name,
  onChangeArtistNames,
  onChangeName,
  onChangeYear,
  year,
}: CollectionFormFieldsProps) {
  return (
    <>
      <CollectionFormTextField
        autoCapitalize="words"
        autoCorrect={false}
        editable={actionState.canEdit}
        label="Name"
        onChangeText={onChangeName}
        placeholder={copy.namePlaceholder}
        returnKeyType={fieldState.nameReturnKeyType}
        value={name}
      />

      {fieldState.showsYear ? (
        <CollectionFormTextField
          editable={actionState.canEdit}
          inputMode="numeric"
          keyboardType="number-pad"
          label="Year"
          onChangeText={onChangeYear}
          placeholder={fieldState.yearPlaceholder}
          returnKeyType={fieldState.yearReturnKeyType}
          value={year}
        />
      ) : null}

      {fieldState.showsArtistNames ? (
        <CollectionFormTextField
          autoCapitalize="words"
          editable={actionState.canEdit}
          label="Artists"
          onChangeText={onChangeArtistNames}
          placeholder={fieldState.artistNamesPlaceholder}
          returnKeyType={fieldState.artistNamesReturnKeyType}
          value={artistNames ?? ""}
        />
      ) : null}
    </>
  );
}
