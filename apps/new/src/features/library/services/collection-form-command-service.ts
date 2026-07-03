import {
  createAlbum,
  createArtistWithImage,
  createPlaylist,
} from "../repository/collection-create-repository";
import {
  updateAlbum,
  updateArtist,
  updatePlaylist,
} from "../repository/collection-update-repository";
import {
  createCollectionFormCommandFactory,
  updateCollectionFormCommandFactory,
} from "./collection-form-command-factory-service";
import type { CollectionFormKind } from "./collection-form-domain-service";

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

const createCollectionFromFormWithRepository =
  createCollectionFormCommandFactory({
    createAlbum,
    createArtistWithImage,
    createPlaylist,
  });

const updateCollectionFromFormWithRepository =
  updateCollectionFormCommandFactory({
    updateAlbum,
    updateArtist,
    updatePlaylist,
  });

export const createCollectionFromFormCommand = (
  params: CreateCollectionFromFormCommandParams,
) => createCollectionFromFormWithRepository(params);

export const updateCollectionFromFormCommand = (
  params: UpdateCollectionFromFormCommandParams,
) => updateCollectionFromFormWithRepository(params);
