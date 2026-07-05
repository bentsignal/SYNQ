import {
  parseAlbumYearInput,
  type CollectionFormKind,
} from "./collection-form-domain-service";
import type { CollectionFormCreateRepository } from "./collection-form-mutation-repository-service";

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
