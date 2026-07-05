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

export const createCollectionFromFormWithRepository =
  createCollectionFormCommandFactory({
    createAlbum,
    createArtistWithImage,
    createPlaylist,
  });

export const updateCollectionFromFormWithRepository =
  updateCollectionFormCommandFactory({
    updateAlbum,
    updateArtist,
    updatePlaylist,
  });
