import { useCallback, useEffect, useMemo, useState } from "react";
import { PageType, type SongType } from "@/src/constants/Types";
import { useSongSheetPresenter } from "@/src/features/action-sheet/hooks/use-song-sheet-presenter";
import { getImportSongCover } from "@/src/features/import/lib/import-song-edits";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function useSongRow(song: SongType, previous = false) {
  const { presentSongSheet } = useSongSheetPresenter();
  const { selectEnabled, selectedSongs, setSelectedSongs } =
    useSelectionContext();
  const [coverImage, setCoverImage] = useState("");

  const selected = selectedSongs.includes(song.id);
  const displayMetadata = useMemo(
    () => ({
      album: song.album ?? "",
      artist: song.artist ?? "",
      fileName: song.fileName ?? "",
      title: song.title ?? "",
    }),
    [song.album, song.artist, song.fileName, song.title],
  );
  const displayCover =
    song.pageType === PageType.IMPORT ? coverImage : song.artwork;
  const disablePlay =
    song.pageType !== undefined &&
    [PageType.IMPORT, PageType.QUEUE, PageType.REORDER].includes(
      song.pageType,
    );

  const opacity = useSharedValue(previous ? 0.3 : 1);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(previous ? 0.3 : 1, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [opacity, previous]);

  useEffect(() => {
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled, setSelectedSongs]);

  const loadCover = useCallback(async () => {
    try {
      if (song.pageType === PageType.IMPORT) {
        const cover = await getImportSongCover(song);
        setCoverImage(cover ?? "");
      }
    } catch {
      setCoverImage("");
    }
  }, [song]);

  useEffect(() => {
    if (song.pageType === PageType.IMPORT) {
      void loadCover();
    }
  }, [loadCover, song.pageType]);

  const toggleSelected = useCallback(() => {
    setSelectedSongs((currentSelectedSongs) => {
      if (currentSelectedSongs.includes(song.id)) {
        return currentSelectedSongs.filter((selectedId) => selectedId !== song.id);
      }

      return [...currentSelectedSongs, song.id];
    });
  }, [setSelectedSongs, song.id]);

  const handleMore = useCallback(async () => {
    presentSongSheet(song);
  }, [presentSongSheet, song]);

  return {
    disablePlay,
    displayCover,
    displayMetadata,
    handleMore,
    opacityStyle,
    selectEnabled,
    selected,
    toggleSelected,
  };
}
