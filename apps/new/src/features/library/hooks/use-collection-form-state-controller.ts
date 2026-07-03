import { useEffect, useReducer } from "react";
import {
  collectionFormReducer,
  getInitialCollectionFormState,
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
    ...resultState,
    dispatchFormState,
    formState,
    updateArtistNames: updateField("artistNames"),
    updateName: updateField("name"),
    updateYear: updateField("year"),
  };
}
