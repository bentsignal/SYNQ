import {
  createCollectionFromForm,
  updateCollectionFromForm,
} from "./collection-form-mutation-service";
import type {
  CollectionFormCreateRepository,
  CollectionFormUpdateRepository,
} from "./collection-form-mutation-repository-service";
import type {
  CreateCollectionFromFormCommandParams,
  UpdateCollectionFromFormCommandParams,
} from "./collection-form-command-factory-types-service";

export type {
  CreateCollectionFromFormCommandParams,
  UpdateCollectionFromFormCommandParams,
} from "./collection-form-command-factory-types-service";

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
