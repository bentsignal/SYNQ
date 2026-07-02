import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { CollectionFormActions } from "./CollectionFormActions";
import { CollectionFormFields } from "./CollectionFormFields";
import { CollectionFormHeader } from "./CollectionFormHeader";
import { CollectionImageInput } from "./CollectionImageInput";
import type { CollectionFormViewProps } from "./collection-form-types";
import { getCollectionFormBackLink } from "../services/collection-form-service";

export function CollectionFormView({
  actionState,
  copy,
  errorMessages = [],
  image,
  imageFallbackName,
  imageFallbackUri,
  imageInitial,
  isSaving,
  kind,
  name,
  onChangeName,
  onChangeYear,
  onPickImage,
  onSave,
  saveLabel,
  subtitle,
  year,
}: CollectionFormViewProps) {
  const theme = useCustomizationTheme();
  const backLink = getCollectionFormBackLink();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <CollectionFormHeader copy={copy} subtitle={subtitle} />

      <View
        style={[
          styles.form,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <CollectionFormFields
          actionState={actionState}
          copy={copy}
          kind={kind}
          name={name}
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
        href={backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {backLink.label}
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
  form: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
