import { useCallback, useEffect, useState } from "react";
import { PageType, PlaylistType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useEntitySheetPresenter } from "@/src/features/action-sheet/hooks/use-entity-sheet-presenter";
import {
  addSongToLibraryPlaylist,
  getLibraryPlaylistCoverPath,
  isSongInLibraryPlaylist,
  removeSongFromLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import { router } from "expo-router";

export function usePlaylistRow(playlist: PlaylistType) {
  const { editSong } = useActionSheetContext();
  const { presentPlaylistSheet } = useEntitySheetPresenter();
  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getLibraryPlaylistCoverPath(playlist.id);
      setFallbackCoverImage(cover ?? "");
    } catch {
      setFallbackCoverImage("");
    }
  }, [playlist.id]);

  const playlistChangesMade = useCallback(
    async (add: boolean) => {
      try {
        if (add) {
          await addSongToLibraryPlaylist(playlist.id, editSong.id);
        } else {
          await removeSongFromLibraryPlaylist(playlist.id, editSong.id);
        }
      } catch (error) {
        console.log("error saving playlist changes: ", error);
      }
    },
    [editSong.id, playlist.id],
  );

  useEffect(() => {
    if (playlist.image) {
      setFallbackCoverImage("");
    } else {
      void loadFallbackCover();
    }
  }, [loadFallbackCover, playlist.id, playlist.image]);

  useEffect(() => {
    if (editSong.id && playlist.pageType === PageType.ADD) {
      isSongInLibraryPlaylist(playlist.id, editSong.id)
        .then((result) => {
          setSelected(result);
        })
        .catch((error) => {
          console.log("error checking if song is in playlist:", error);
        });
    }
  }, [editSong.id, playlist.id, playlist.pageType]);

  const handleMore = useCallback(async () => {
    presentPlaylistSheet(playlist);
  }, [playlist, presentPlaylistSheet]);

  const handleSelect = useCallback(async () => {
    const nextSelected = !selected;
    setSelected(nextSelected);
    await playlistChangesMade(nextSelected);
  }, [playlistChangesMade, selected]);

  const handlePress = useCallback(async () => {
    if (playlist.pageType === PageType.ADD) {
      await handleSelect();
    } else {
      router.push(`/library/playlist/${playlist.id}`);
    }
  }, [handleSelect, playlist.id, playlist.pageType]);

  return {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  };
}
