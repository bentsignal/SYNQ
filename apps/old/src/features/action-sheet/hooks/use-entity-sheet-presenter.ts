import { PageType, type AlbumType, type ArtistType, type PlaylistType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useCallback } from "react";

export function useEntitySheetPresenter() {
  const { setEditAlbum, setEditArtist, setEditPlaylist } =
    useActionSheetContext();
  const { sendHaptic } = useHaptics();

  const presentAlbumSheet = useCallback(
    (album: AlbumType | null | undefined) => {
      if (!album) {
        return;
      }

      sendHaptic("light");
      setEditAlbum(album);
      try {
        TrueSheet.present("album-sheet");
      } catch (error) {
        console.log("error snapping to album sheet:", error);
      }
    },
    [sendHaptic, setEditAlbum],
  );

  const presentArtistSheet = useCallback(
    (artist: ArtistType | null | undefined) => {
      if (!artist) {
        return;
      }

      sendHaptic("light");
      setEditArtist(artist);
      try {
        TrueSheet.present("artist-sheet");
      } catch (error) {
        console.log("error snapping to artist sheet:", error);
      }
    },
    [sendHaptic, setEditArtist],
  );

  const presentPlaylistSheet = useCallback(
    (playlist: PlaylistType | null | undefined) => {
      if (!playlist) {
        return;
      }

      sendHaptic("light");
      setEditPlaylist({ ...playlist, pageType: PageType.PLAYLIST });
      try {
        TrueSheet.present("playlist-sheet");
      } catch (error) {
        console.log("error snapping to playlist sheet:", error);
      }
    },
    [sendHaptic, setEditPlaylist],
  );

  return {
    presentAlbumSheet,
    presentArtistSheet,
    presentPlaylistSheet,
  };
}
