export type CollectionFormImage = {
  dataUrl: string;
  fileName: string;
};

export type CollectionFormAction =
  | {
      artistNames: string;
      name: string;
      type: "hydrate";
      year: string;
    }
  | {
      field: "artistNames" | "name" | "year";
      type: "change-field";
      value: string;
    }
  | {
      image: CollectionFormImage;
      type: "pick-image";
    }
  | {
      error: string;
      type: "fail";
    }
  | {
      type: "begin-save";
    }
  | {
      type: "finish-save";
    }
  | {
      type: "clear-error";
    };

export type CollectionFormField =
  Extract<CollectionFormAction, { type: "change-field" }>["field"];

export const getCollectionFormHydrateAction = ({
  artistNames,
  name,
  year,
}: {
  artistNames: string;
  name: string;
  year: string;
}): CollectionFormAction => ({
  artistNames,
  name,
  type: "hydrate",
  year,
});

export const getCollectionFormChangeFieldAction = ({
  field,
  value,
}: {
  field: CollectionFormField;
  value: string;
}): CollectionFormAction => ({
  field,
  type: "change-field",
  value,
});

export const getCollectionFormFinishSaveAction = (): CollectionFormAction => ({
  type: "finish-save",
});
