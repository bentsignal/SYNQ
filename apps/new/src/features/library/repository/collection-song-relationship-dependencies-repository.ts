export type CollectionSongRelationshipDependencies = {
  protectedPlaylistIds: Set<number>;
  removeAlbumSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  removeArtistSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  removePlaylistSong: (params: {
    collectionId: number;
    songId: number;
  }) => Promise<void>;
  updateAlbumSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
  updateArtistSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
  updatePlaylistSongOrder: (params: {
    collectionId: number;
    order: number;
    songId: number;
  }) => Promise<void>;
};
