import {
  parseAlbumYearInput,
  type CollectionFormKind,
} from "./collection-form-domain-service";

export type CreatedCollection = {
  id: number;
};

export type CollectionFormCreateRepository = {
  createAlbum: (params: {
    coverImage?: string | null;
    name: string;
    year?: number;
  }) => Promise<CreatedCollection>;
  createArtistWithImage: (params: {
    name: string;
    profileImage?: string | null;
  }) => Promise<CreatedCollection>;
  createPlaylist: (params: {
    coverImage?: string | null;
    name: string;
  }) => Promise<CreatedCollection>;
};

export type CollectionFormUpdateRepository = {
  updateAlbum: (params: {
    artistNames?: string;
    coverImage?: string | null;
    id: number;
    name: string;
    year?: number | null;
  }) => Promise<unknown>;
  updateArtist: (params: {
    id: number;
    name: string;
    profileImage?: string | null;
  }) => Promise<unknown>;
  updatePlaylist: (params: {
    coverImage?: string | null;
    id: number;
    name: string;
  }) => Promise<unknown>;
};

export const createCollectionFromForm = async ({
  imageDataUrl,
  kind,
  name,
  repository,
  year,
}: {
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  repository: CollectionFormCreateRepository;
  year: string;
}) => {
  switch (kind) {
    case "album":
      return repository.createAlbum({
        coverImage: imageDataUrl,
        name,
        year: parseAlbumYearInput(year),
      });
    case "artist":
      return repository.createArtistWithImage({
        name,
        profileImage: imageDataUrl,
      });
    case "playlist":
      return repository.createPlaylist({
        coverImage: imageDataUrl,
        name,
      });
  }
};

export const updateCollectionFromForm = async ({
  artistNames,
  id,
  imageDataUrl,
  kind,
  name,
  repository,
  year,
}: {
  artistNames?: string;
  id: number;
  imageDataUrl?: string | null;
  kind: CollectionFormKind;
  name: string;
  repository: CollectionFormUpdateRepository;
  year: string;
}) => {
  switch (kind) {
    case "album":
      return repository.updateAlbum({
        artistNames,
        coverImage: imageDataUrl,
        id,
        name,
        year: parseAlbumYearInput(year) ?? null,
      });
    case "artist":
      return repository.updateArtist({
        id,
        name,
        profileImage: imageDataUrl,
      });
    case "playlist":
      return repository.updatePlaylist({
        coverImage: imageDataUrl,
        id,
        name,
      });
  }
};
