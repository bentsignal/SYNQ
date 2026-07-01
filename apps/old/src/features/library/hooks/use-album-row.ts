import { useCallback, useEffect, useState } from "react";
import { AlbumType, PageType, SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useEntitySheetPresenter } from "@/src/features/action-sheet/hooks/use-entity-sheet-presenter";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  addImportSongAlbum,
  removeImportSongAlbum,
  replaceImportSong,
} from "@/src/features/import/lib/import-song-edits";
import {
  getLibraryAlbumArtists,
  getLibraryAlbumCoverPath,
} from "@/src/features/library/repository/library-entity-repository";
import {
  addAlbumToLibrarySong,
  addArtistToLibrarySong,
  isAlbumOnLibrarySong,
  removeAlbumFromLibrarySong,
  removeArtistFromLibrarySong,
} from "@/src/features/library/repository/library-song-repository";
import { router } from "expo-router";

export function useAlbumRow(album: AlbumType) {
  const { editSong, setEditSong } = useActionSheetContext();
  const { setResults } = useImportFlowContext();
  const { presentAlbumSheet } = useEntitySheetPresenter();
  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getLibraryAlbumCoverPath(album.id);
      setFallbackCoverImage(cover ?? "");
    } catch (error) {
      console.log("error loading album cover:", error);
    }
  }, [album.id]);

  useEffect(() => {
    if (album.image) {
      setFallbackCoverImage("");
    } else {
      void loadFallbackCover();
    }
  }, [album.id, album.image, loadFallbackCover]);

  const selectionChanged = useCallback(
    async (add: boolean) => {
      try {
        const artists = await getLibraryAlbumArtists(album.id);
        if (editSong.pageType === PageType.IMPORT) {
          if (add) {
            addImportSongAlbum(editSong, album, artists);
          } else {
            removeImportSongAlbum(editSong, album.id, artists);
          }
          setEditSong({ ...editSong });
          setResults((currentResults: SongType[]) =>
            replaceImportSong(currentResults, editSong),
          );
        } else {
          if (add) {
            await addAlbumToLibrarySong(album.id, editSong.id);
            await Promise.all(
              artists.map((artist) =>
                addArtistToLibrarySong(artist.id, editSong.id),
              ),
            );
          } else {
            await removeAlbumFromLibrarySong(album.id, editSong.id);
            await Promise.all(
              artists.map((artist) =>
                removeArtistFromLibrarySong(artist.id, editSong.id),
              ),
            );
          }
          setEditSong({ ...editSong });
        }
      } catch (error) {
        console.log("error saving album list changes: ", error);
      }
    },
    [album, editSong, setEditSong, setResults],
  );

  const checkAlbumOnSong = useCallback(async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result =
        editSong.importAlbums?.some(
          (importAlbum: AlbumType) => importAlbum.id === album.id,
        ) ?? false;
    } else {
      result = await isAlbumOnLibrarySong(album.id, editSong.id);
    }
    setSelected(result);
  }, [album.id, editSong]);

  useEffect(() => {
    if (editSong.id && album.pageType === PageType.ADD) {
      void checkAlbumOnSong();
    }
  }, [album.pageType, checkAlbumOnSong, editSong.id]);

  const handleMore = useCallback(async () => {
    presentAlbumSheet(album);
  }, [album, presentAlbumSheet]);

  const handleSelect = useCallback(async () => {
    const nextSelected = !selected;
    setSelected(nextSelected);
    await selectionChanged(nextSelected);
  }, [selected, selectionChanged]);

  const handlePress = useCallback(async () => {
    if (album.pageType === PageType.ADD) {
      await handleSelect();
    } else {
      router.push(`/library/album/${album.id}`);
    }
  }, [album.id, album.pageType, handleSelect]);

  return {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  };
}
