import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import { getPlayableCollectionSongs } from "./library-collection-playable-songs-service";
import { isProtectedPlaylistId } from "./library-playlist-constants-service";

export const canDeleteLibraryCollection = ({
  id,
  isMissing,
  kind,
}: {
  id: number;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
}) => !isMissing && (kind !== "playlist" || !isProtectedPlaylistId(id));

export const canMutateLibraryCollectionMembership = ({
  id,
  isMissing,
  kind,
}: {
  id: number;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
}) => !isMissing && (kind !== "playlist" || !isProtectedPlaylistId(id));

export const canEditLibraryCollection = ({
  id,
  isMissing,
  kind,
}: {
  id: number;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
}) => canMutateLibraryCollectionMembership({ id, isMissing, kind });

export const getCollectionDetailActionState = ({
  id,
  isDeleting,
  isExporting,
  isMissing,
  kind,
  songs,
}: {
  id: number;
  isDeleting: boolean;
  isExporting: boolean;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  songs: LibraryCollectionDetailSong[];
}) => {
  const playableSongs = getPlayableCollectionSongs(songs);
  const hasPlayableSongs = playableSongs.length > 0;
  const canDeleteCollection = canDeleteLibraryCollection({
    id,
    isMissing,
    kind,
  });
  const canEditCollection = canEditLibraryCollection({
    id,
    isMissing,
    kind,
  });
  const canMutateSongs = canMutateLibraryCollectionMembership({
    id,
    isMissing,
    kind,
  });

  return {
    canDelete: canDeleteCollection && !isDeleting,
    canEdit: canEditCollection,
    canExport: hasPlayableSongs && !isExporting,
    canMutateSongs,
    canPlay: hasPlayableSongs,
    canQueue: hasPlayableSongs,
    deleteLabel: isDeleting ? "Deleting" : "Delete",
    exportLabel: isExporting ? "Exporting" : "Export",
    playableSongs,
  };
};

export type CollectionDetailActionState = ReturnType<
  typeof getCollectionDetailActionState
>;
