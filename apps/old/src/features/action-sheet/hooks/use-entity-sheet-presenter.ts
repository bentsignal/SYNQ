import { PageType, type AlbumType, type ArtistType, type PlaylistType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { presentActionSheetItem } from "@/src/features/action-sheet/lib/present-action-sheet";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useCallback } from "react";

export function useEntitySheetPresenter() {
  const { setEditAlbum, setEditArtist, setEditPlaylist } =
    useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const presentAlbumSheet = useCallback(
    (album: AlbumType | null | undefined) => {
      presentActionSheetItem({
        getSheetName: () => "album-sheet",
        item: album,
        sendHaptic,
        setItem: setEditAlbum,
      });
    },
    [sendHaptic, setEditAlbum],
  );

  const presentArtistSheet = useCallback(
    (artist: ArtistType | null | undefined) => {
      presentActionSheetItem({
        getSheetName: () => "artist-sheet",
        item: artist,
        sendHaptic,
        setItem: setEditArtist,
      });
    },
    [sendHaptic, setEditArtist],
  );

  const presentPlaylistSheet = useCallback(
    (playlist: PlaylistType | null | undefined) => {
      presentActionSheetItem({
        getPayload: (item) => ({ ...item, pageType: PageType.PLAYLIST }),
        getSheetName: () => "playlist-sheet",
        item: playlist,
        sendHaptic,
        setItem: setEditPlaylist,
      });
    },
    [sendHaptic, setEditPlaylist],
  );

  return {
    presentAlbumSheet,
    presentArtistSheet,
    presentPlaylistSheet,
  };
}
