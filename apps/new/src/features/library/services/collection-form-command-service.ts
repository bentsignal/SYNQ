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
  type CreateCollectionFromFormCommandParams,
  type UpdateCollectionFromFormCommandParams,
} from "./collection-form-command-factory-service";

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
