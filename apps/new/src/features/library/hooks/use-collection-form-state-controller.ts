import { useEffect, useReducer } from "react";
import {
  collectionFormReducer,
  getCollectionFormChangeFieldAction,
  getCollectionFormHydrateAction,
  getInitialCollectionFormState,
  type CollectionFormField,
} from "../services/collection-form-state-service";
import {
  getCollectionFormControllerResultState,
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
  const resultState = getCollectionFormControllerResultState({
    fallbackInitial,
    formState,
    isMissing,
    saveLabel,
    savingLabel,
  });

  useEffect(() => {
    if (!hydrateFrom?.updatedAt) {
      return;
    }

    dispatchFormState(getCollectionFormHydrateAction({
      artistNames: hydrateFrom.artistNames ?? "",
      name: hydrateFrom.name,
      year: hydrateFrom.year,
    }));
  }, [
    hydrateFrom?.artistNames,
    hydrateFrom?.name,
    hydrateFrom?.updatedAt,
    hydrateFrom?.year,
  ]);

  const updateField =
    (field: CollectionFormField) => (value: string) => {
      dispatchFormState(getCollectionFormChangeFieldAction({ field, value }));
    };

  return {
    ...resultState,
    dispatchFormState,
    formState,
    updateArtistNames: updateField("artistNames"),
    updateName: updateField("name"),
    updateYear: updateField("year"),
  };
}
