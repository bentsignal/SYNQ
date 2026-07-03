import type { CollectionFormKind } from "./collection-form-domain-service";
import {
  createCollectionFromForm,
  updateCollectionFromForm,
  type CollectionFormCreateRepository,
  type CollectionFormUpdateRepository,
} from "./collection-form-mutation-service";

type CreateCollectionFromFormCommandParams = {
  artistNames?: string;
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  year: string;
};

type UpdateCollectionFromFormCommandParams =
  CreateCollectionFromFormCommandParams & {
    id: number;
  };

export const createCollectionFormCommandFactory =
  (repository: CollectionFormCreateRepository) =>
  ({ imageDataUrl, kind, name, year }: CreateCollectionFromFormCommandParams) =>
    createCollectionFromForm({
      imageDataUrl,
      kind,
      name,
      repository,
      year,
    });

export const updateCollectionFormCommandFactory =
  (repository: CollectionFormUpdateRepository) =>
  ({
    artistNames,
    id,
    imageDataUrl,
    kind,
    name,
    year,
  }: UpdateCollectionFromFormCommandParams) =>
    updateCollectionFromForm({
      artistNames,
      id,
      imageDataUrl,
      kind,
      name,
      repository,
      year,
    });
