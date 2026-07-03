import { Text, TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getCollectionFormFieldState,
  type CollectionFormActionState,
} from "../services/collection-form-interaction-service";
import type {
  CollectionFormCopy,
  CollectionFormKind,
} from "./collection-form-types";

type CollectionFormFieldsProps = {
  actionState: CollectionFormActionState;
  artistNames?: string;
  copy: CollectionFormCopy;
  kind: CollectionFormKind;
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
  kind,
  name,
  onChangeArtistNames,
  onChangeName,
  onChangeYear,
  year,
}: CollectionFormFieldsProps) {
  const theme = useCustomizationTheme();
  const fieldState = getCollectionFormFieldState(kind);

  return (
    <>
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Name
      </Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        className="min-h-[50px] rounded-lg border px-3.5 text-base font-bold"
        editable={actionState.canEdit}
        onChangeText={onChangeName}
        placeholder={copy.namePlaceholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.nameReturnKeyType}
        style={{ borderColor: theme.border, color: theme.primaryText }}
        value={name}
      />

      {fieldState.showsYear ? (
        <>
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ color: theme.secondaryText }}
          >
            Year
          </Text>
          <TextInput
            className="min-h-[50px] rounded-lg border px-3.5 text-base font-bold"
            editable={actionState.canEdit}
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={onChangeYear}
            placeholder={fieldState.yearPlaceholder}
            placeholderTextColor={theme.mutedText}
            returnKeyType={fieldState.yearReturnKeyType}
            style={{ borderColor: theme.border, color: theme.primaryText }}
            value={year}
          />
        </>
      ) : null}

      {fieldState.showsArtistNames ? (
        <>
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ color: theme.secondaryText }}
          >
            Artists
          </Text>
          <TextInput
            autoCapitalize="words"
            className="min-h-[50px] rounded-lg border px-3.5 text-base font-bold"
            editable={actionState.canEdit}
            onChangeText={onChangeArtistNames}
            placeholder={fieldState.artistNamesPlaceholder}
            placeholderTextColor={theme.mutedText}
            returnKeyType={fieldState.artistNamesReturnKeyType}
            style={{ borderColor: theme.border, color: theme.primaryText }}
            value={artistNames ?? ""}
          />
        </>
      ) : null}
    </>
  );
}
