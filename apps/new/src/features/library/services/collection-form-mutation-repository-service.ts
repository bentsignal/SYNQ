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
