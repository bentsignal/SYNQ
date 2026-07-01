import { useCallback, useEffect, useMemo, useState } from "react";
import { PageType, type SongType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { getImportSongCover } from "@/src/features/import/lib/import-song-edits";
import { useSelectionContext } from "@/src/features/selection/context/SelectionProvider";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function useSongRow(song: SongType, previous = false) {
  const { setEditSong } = useActionSheetContext();
  const { selectEnabled, selectedSongs, setSelectedSongs } =
    useSelectionContext();
  const { sendHaptic } = useHaptics();
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
    } catch (error) {
      console.log("error loading song cover:", error);
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
    sendHaptic("light");
    setEditSong(song);
    if (song.pageType === PageType.IMPORT) {
      TrueSheet.present("import-song-sheet");
    } else {
      TrueSheet.present("song-sheet");
    }
  }, [sendHaptic, setEditSong, song]);

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
