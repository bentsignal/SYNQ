import { useCallback, useEffect, useState } from "react";
import {
  ArtistType,
  PageType,
  SongType,
  SourceType,
} from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useEntitySheetPresenter } from "@/src/features/action-sheet/hooks/use-entity-sheet-presenter";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  addImportSongArtist,
  removeImportSongArtist,
  replaceImportSong,
} from "@/src/features/import/lib/import-song-edits";
import {
  addArtistToLibraryAlbum,
  getLibraryArtistCoverPath,
  isArtistOnLibraryAlbum,
  removeArtistFromLibraryAlbum,
} from "@/src/features/library/repository/library-entity-repository";
import {
  addArtistToLibrarySong,
  isArtistOnLibrarySong,
  removeArtistFromLibrarySong,
} from "@/src/features/library/repository/library-song-repository";
import { router } from "expo-router";

export function useArtistRow(artist: ArtistType) {
  const {
    editAlbum,
    editSong,
    setEditAlbum,
    setEditSong,
  } = useActionSheetContext();
  const { setResults } = useImportFlowContext();
  const { presentArtistSheet } = useEntitySheetPresenter();
  const [selected, setSelected] = useState(false);
  const [fallbackCoverImage, setFallbackCoverImage] = useState("");

  const loadFallbackCover = useCallback(async () => {
    try {
      const cover = await getLibraryArtistCoverPath(artist.id);
      setFallbackCoverImage(cover ?? "");
    } catch {
      setFallbackCoverImage("");
    }
  }, [artist.id]);

  const selectionChanged = useCallback(
    async (add: boolean) => {
      try {
        if (artist.sourceType === SourceType.ALBUM && editAlbum) {
          if (add) {
            await addArtistToLibraryAlbum(artist.id, editAlbum.id);
          } else {
            await removeArtistFromLibraryAlbum(artist.id, editAlbum.id);
          }
          setEditAlbum({ ...editAlbum });
        } else if (artist.sourceType === SourceType.SONG && editSong) {
          if (editSong.pageType === PageType.IMPORT) {
            if (add) {
              addImportSongArtist(editSong, artist);
            } else {
              removeImportSongArtist(editSong, artist.id);
            }
            setEditSong({ ...editSong });
            setResults((currentResults: SongType[]) =>
              replaceImportSong(currentResults, editSong),
            );
          } else {
            if (add) {
              await addArtistToLibrarySong(artist.id, editSong.id);
            } else {
              await removeArtistFromLibrarySong(artist.id, editSong.id);
            }
            setEditSong({ ...editSong });
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    [artist, editAlbum, editSong, setEditAlbum, setEditSong, setResults],
  );

  const checkArtistOnSong = useCallback(async () => {
    let result = false;
    if (editSong.pageType === PageType.IMPORT) {
      result =
        editSong.importArtists?.some(
          (importArtist: ArtistType) => importArtist.id === artist.id,
        ) ?? false;
    } else {
      result = await isArtistOnLibrarySong(artist.id, editSong.id);
    }
    setSelected(result);
  }, [artist.id, editSong]);

  const checkArtistOnAlbum = useCallback(async () => {
    const result = await isArtistOnLibraryAlbum(artist.id, editAlbum.id);
    setSelected(result);
  }, [artist.id, editAlbum.id]);

  useEffect(() => {
    if (editSong.id && artist.sourceType === SourceType.SONG) {
      void checkArtistOnSong();
    } else if (editAlbum.id && artist.sourceType === SourceType.ALBUM) {
      void checkArtistOnAlbum();
    }
  }, [
    artist.sourceType,
    checkArtistOnAlbum,
    checkArtistOnSong,
    editAlbum.id,
    editSong.id,
  ]);

  useEffect(() => {
    if (artist.image) {
      setFallbackCoverImage("");
    } else {
      void loadFallbackCover();
    }
  }, [artist.id, artist.image, loadFallbackCover]);

  const handleMore = useCallback(async () => {
    presentArtistSheet(artist);
  }, [artist, presentArtistSheet]);

  const handleSelect = useCallback(async () => {
    const nextSelected = !selected;
    setSelected(nextSelected);
    const saved = await selectionChanged(nextSelected);
    if (!saved) {
      setSelected(selected);
    }
  }, [selected, selectionChanged]);

  const handlePress = useCallback(async () => {
    if (artist.pageType === PageType.ADD) {
      await handleSelect();
    } else {
      router.push(`/library/artist/${artist.id}`);
    }
  }, [artist.id, artist.pageType, handleSelect]);

  return {
    fallbackCoverImage,
    handleMore,
    handlePress,
    handleSelect,
    selected,
  };
}
