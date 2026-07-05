import {
  createAlbumWithDependencies,
  type AlbumCreateDependencies,
} from "./album-create-executor-repository";
import {
  createArtistWithDependencies,
  type ArtistCreateDependencies,
} from "./artist-create-executor-repository";
import {
  createPlaylistWithDependencies,
  type PlaylistCreateDependencies,
} from "./playlist-create-executor-repository";

export type CollectionCreateDependencies = AlbumCreateDependencies &
  ArtistCreateDependencies &
  PlaylistCreateDependencies;

export {
  createAlbumWithDependencies,
  type AlbumCreateDependencies,
  createArtistWithDependencies,
  type ArtistCreateDependencies,
  createPlaylistWithDependencies,
  type PlaylistCreateDependencies,
};
