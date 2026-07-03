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
  createCollectionFromForm,
  updateCollectionFromForm,
} from "./collection-form-mutation-service";
import type { CollectionFormKind } from "./collection-form-service";

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

export const createCollectionFromFormCommand = ({
  imageDataUrl,
  kind,
  name,
  year,
}: CreateCollectionFromFormCommandParams) =>
  createCollectionFromForm({
    imageDataUrl,
    kind,
    name,
    repository: {
      createAlbum,
      createArtistWithImage,
      createPlaylist,
    },
    year,
  });

export const updateCollectionFromFormCommand = ({
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
    repository: {
      updateAlbum,
      updateArtist,
      updatePlaylist,
    },
    year,
  });
