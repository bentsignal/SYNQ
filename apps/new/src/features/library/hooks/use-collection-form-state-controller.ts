import { useEffect, useReducer } from "react";
import {
  collectionFormReducer,
  getInitialCollectionFormState,
} from "../services/collection-form-state-service";
import {
  getCollectionFormActionState,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
} from "../services/collection-form-interaction-service";

type CollectionFormHydration = {
  artistNames?: string;
  name: string;
  updatedAt: Date | undefined;
  year: string;
};

export function useCollectionFormStateController({
  fallbackInitial,
  hydrateFrom,
  isMissing,
  saveLabel,
  savingLabel,
}: {
  fallbackInitial: string;
  hydrateFrom?: CollectionFormHydration;
  isMissing?: boolean;
  saveLabel: string;
  savingLabel: string;
}) {
  const [formState, dispatchFormState] = useReducer(
    collectionFormReducer,
    undefined,
    getInitialCollectionFormState,
  );
  const actionState = getCollectionFormActionState({
    isMissing,
    isSaving: formState.isSaving,
    name: formState.name,
  });
  const imageInitial = getCollectionFormPreviewInitial({
    fallback: fallbackInitial,
    name: formState.name,
  });
  const resolvedSaveLabel = getCollectionFormSaveLabel({
    defaultLabel: saveLabel,
    isSaving: formState.isSaving,
    savingLabel,
  });

  useEffect(() => {
    if (!hydrateFrom?.updatedAt) {
      return;
    }

    dispatchFormState({
      artistNames: hydrateFrom.artistNames ?? "",
      name: hydrateFrom.name,
      type: "hydrate",
      year: hydrateFrom.year,
    });
  }, [
    hydrateFrom?.artistNames,
    hydrateFrom?.name,
    hydrateFrom?.updatedAt,
    hydrateFrom?.year,
  ]);

  const updateField =
    (field: "artistNames" | "name" | "year") => (value: string) => {
      dispatchFormState({ field, type: "change-field", value });
    };

  return {
    actionState,
    dispatchFormState,
    formState,
    imageInitial,
    saveLabel: resolvedSaveLabel,
    updateArtistNames: updateField("artistNames"),
    updateName: updateField("name"),
    updateYear: updateField("year"),
  };
}
