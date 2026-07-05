import type { CollectionFormKind } from "./collection-form-domain-service";

export type CreateCollectionFromFormCommandParams = {
  artistNames?: string;
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
};

export type UpdateCollectionFromFormCommandParams =
  CreateCollectionFromFormCommandParams & {
    id: number;
  };
