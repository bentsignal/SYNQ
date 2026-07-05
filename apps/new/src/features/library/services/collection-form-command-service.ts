import {
  createCollectionFromFormWithRepository,
  updateCollectionFromFormWithRepository,
} from "./collection-form-command-dependencies-service";
import type {
  CreateCollectionFromFormCommandParams,
  UpdateCollectionFromFormCommandParams,
} from "./collection-form-command-factory-service";

export const createCollectionFromFormCommand = (
  params: CreateCollectionFromFormCommandParams,
) => createCollectionFromFormWithRepository(params);

export const updateCollectionFromFormCommand = (
  params: UpdateCollectionFromFormCommandParams,
) => updateCollectionFromFormWithRepository(params);
