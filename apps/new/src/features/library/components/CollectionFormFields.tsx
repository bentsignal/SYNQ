import { StyleSheet, Text, TextInput } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getCollectionFormFieldState,
  type CollectionFormActionState,
} from "../services/collection-form-service";
import type {
  CollectionFormCopy,
  CollectionFormKind,
} from "./collection-form-types";

type CollectionFormFieldsProps = {
  actionState: CollectionFormActionState;
  copy: CollectionFormCopy;
  kind: CollectionFormKind;
  name: string;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  year: string;
};

export function CollectionFormFields({
  actionState,
  copy,
  kind,
  name,
  onChangeName,
  onChangeYear,
  year,
}: CollectionFormFieldsProps) {
  const theme = useCustomizationTheme();
  const fieldState = getCollectionFormFieldState(kind);

  return (
    <>
      <Text style={[styles.label, { color: theme.secondaryText }]}>Name</Text>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        editable={actionState.canEdit}
        onChangeText={onChangeName}
        placeholder={copy.namePlaceholder}
        placeholderTextColor={theme.mutedText}
        returnKeyType={fieldState.nameReturnKeyType}
        style={[
          styles.input,
          { borderColor: theme.border, color: theme.primaryText },
        ]}
        value={name}
      />

      {fieldState.showsYear ? (
        <>
          <Text style={[styles.label, { color: theme.secondaryText }]}>
            Year
          </Text>
          <TextInput
            editable={actionState.canEdit}
            inputMode="numeric"
            keyboardType="number-pad"
            onChangeText={onChangeYear}
            placeholder={fieldState.yearPlaceholder}
            placeholderTextColor={theme.mutedText}
            returnKeyType={fieldState.yearReturnKeyType}
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.primaryText },
            ]}
            value={year}
          />
        </>
      ) : null}
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
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    minHeight: 50,
    paddingHorizontal: 14,
  },
});
