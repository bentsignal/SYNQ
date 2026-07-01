import { useCallback, useEffect, useState } from "react";
import type { AlbumType, ArtistType } from "@/src/constants/Types";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { pickCoverImage } from "@/src/features/images/repository/image-repository";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  getImportSongCover,
  saveImportSongEdits,
} from "@/src/features/import/lib/import-song-edits";
import {
  getLibrarySongAlbums,
  getLibrarySongArtists,
  getLibrarySongCoverPath,
} from "@/src/features/library/repository/library-song-repository";
import { updateLibrarySongs } from "@/src/features/library/repository/song-metadata-repository";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { router, useFocusEffect } from "expo-router";

export function useEditSongForm(id: number) {
  const { editSong, setNumModified } = useActionSheetContext();
  const { results, setResults } = useImportFlowContext();
  const { selectedSongs, setSelectedSongs, setSelectEnabled } =
    useSelectionContext();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [image, setImage] = useState("");
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const loadArtists = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setArtists(editSong.importArtists ?? []);
      return;
    }

    const nextArtists = await getLibrarySongArtists(id);
    setArtists(nextArtists);
  }, [editSong.importArtists, editSong.pageType, id]);

  const loadAlbums = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      setAlbums(editSong.importAlbums ?? []);
      return;
    }

    const nextAlbums = await getLibrarySongAlbums(id);
    setAlbums(nextAlbums);
  }, [editSong.importAlbums, editSong.pageType, id]);

  const loadCover = useCallback(async () => {
    if (editSong.pageType === PageType.IMPORT) {
      const cover = await getImportSongCover(editSong);
      setImage(cover ?? "");
      return;
    }

    const cover = await getLibrarySongCoverPath(id, true);
    setImage(cover ?? "");
  }, [editSong, id]);

  const refreshRelations = useCallback(() => {
    if (editSong) {
      void loadArtists();
      void loadAlbums();
      void loadCover();
    }
  }, [editSong, loadAlbums, loadArtists, loadCover]);

  useEffect(() => {
    if (editSong) {
      setTitle(editSong.title ?? "");
      setArtist(editSong.artist ?? "");
      setAlbum(editSong.album ?? "");
      refreshRelations();
    }
  }, [editSong, refreshRelations]);

  useFocusEffect(
    useCallback(() => {
      refreshRelations();
    }, [refreshRelations]),
  );

  const handleSave = useCallback(
    async ({
      newTitle,
      newImage,
    }: {
      newTitle: string;
      newImage: string;
    }) => {
      try {
        const editPageType = editSong.pageType;
        if (
          editPageType &&
          [PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(
            editPageType,
          )
        ) {
          await updateLibrarySongs({
            ids: [editSong.id],
            title: newTitle,
            artist,
            album,
            cover: newImage,
          });
        } else if (editSong.pageType === PageType.IMPORT) {
          const newResults = await saveImportSongEdits({
            songs: results,
            ids: [editSong.id],
            title: newTitle,
            artist,
            album,
            artwork: newImage,
          });
          setResults(newResults);
          setNumModified((modified) => modified + 1);
        } else if (selectedSongs.length > 0) {
          const newResults = await saveImportSongEdits({
            songs: results,
            ids: selectedSongs,
            title: newTitle,
            artist,
            album,
            artwork: newImage,
          });
          setResults(newResults);
          setNumModified((modified) => modified + 1);
        }
        setSelectEnabled(false);
      } catch (error) {
        console.log("error saving edits: ", error);
        router.back();
      }
    },
    [
      album,
      artist,
      editSong.id,
      editSong.pageType,
      results,
      selectedSongs,
      setNumModified,
      setResults,
      setSelectEnabled,
    ],
  );

  const handleUpdateImage = useCallback(async () => {
    const cover = await pickCoverImage();
    if (cover) {
      setImage(cover);
      await handleSave({ newTitle: title, newImage: cover });
    }
  }, [handleSave, title]);

  const handleTitleUpdate = useCallback(
    async (text: string) => {
      setTitle(text);
      await handleSave({ newTitle: text, newImage: image });
    },
    [handleSave, image],
  );

  const handleAddAlbums = useCallback(() => {
    router.push("/album/add");
  }, []);

  const handleAddArtists = useCallback(() => {
    router.push("/artist/add?sourceType=song");
  }, []);

  const handleClose = useCallback(() => {
    router.back();
    setSelectedSongs([]);
  }, [setSelectedSongs]);

  return {
    albums,
    artists,
    editSong,
    handleAddAlbums,
    handleAddArtists,
    handleClose,
    handleTitleUpdate,
    handleUpdateImage,
    image,
    selectedSongs,
    title,
  };
}
